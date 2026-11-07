import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
const url = process.env.TEST_DATABASE_URL;
const pool = new Pool({ connectionString: url });
const id = () => randomUUID();
const student = id(),
  other = id(),
  teacher = id(),
  teacher2 = id(),
  admin = id(),
  tech = id(),
  dep = id(),
  dep2 = id(),
  sem = id(),
  form = id(),
  policy = id(),
  event = id(),
  offering = id(),
  offering2 = id();
async function as(user: string, sql: string, args: unknown[] = []) {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await c.query("set local role authenticated");
    await c.query("select set_config('request.jwt.claim.sub',$1,true)", [user]);
    const r = await c.query(sql, args);
    await c.query("commit");
    return r;
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
}
async function summary() {
  const ev = id();
  await pool.query(
    "insert into events select $1,title,description,speaker,organizer,starts_at,ends_at,venue,online_url,capacity,registration_opens,registration_closes,club_approved,summary_deadline,form_id,policy_id,department_id,responsible_id,attendance_method,status,created_at,publicly_listed from events where id=$2",
    [ev, event],
  );
  await pool.query("insert into event_offerings values($1,$2),($1,$3)", [
    ev,
    offering,
    offering2,
  ]);
  await pool.query(
    "insert into attendance values($1,$2,true,'test attendance',$3,now())",
    [ev, student, admin],
  );
  const s = (await as(student, "select begin_submission($1) id", [ev])).rows[0]
    .id;
  return { s, ev };
}
async function attachment(s: string) {
  const a = id();
  await as(student, "select add_attachment($1,$2,'image/jpeg',100,$3)", [
    s,
    a,
    "a".repeat(64),
  ]);
  await pool.query("update attachments set safety='clean' where id=$1", [a]);
  await pool.query(
    "insert into storage.objects(bucket_id,name) select 'summaries',object_path from attachments where id=$1",
    [a],
  );
  return a;
}
async function referred() {
  const { s, ev } = await summary();
  const a = await attachment(s);
  const r = (
    await as(student, "select submit_referral($1,$2,$3) id", [s, offering, a])
  ).rows[0].id;
  return { s, ev, a, r };
}
describe.skipIf(!url)("Postgres RLS and transactional workflow", () => {
  beforeAll(async () => {
    await pool.query("insert into departments(id,name) values($1,$2),($3,$4)", [
      dep,
      "test-" + dep,
      dep2,
      "test-" + dep2,
    ]);
    for (const u of [student, other, teacher, teacher2, admin, tech])
      await pool.query("insert into auth.users(id,email) values($1,$2)", [
        u,
        u + "@example.test",
      ]);
    await pool.query(
      "update profiles set membership='approved',department_id=$1 where id=any($2::uuid[])",
      [dep, [student, other, teacher, teacher2, admin, tech]],
    );
    await pool.query(
      "update roles set approved=true where user_id=any($1::uuid[]) and role='student'",
      [[student, other]],
    );
    await pool.query(
      "insert into roles(user_id,role,department_id,approved) values($1,'instructor',$5,true),($2,'instructor',$5,true),($3,'admin',$5,true),($4,'superadmin',null,true)",
      [teacher, teacher2, admin, tech, dep],
    );
    await pool.query(
      "insert into semesters values($1,'test',current_date-20,current_date+20)",
      [sem],
    );
    await pool.query("insert into forms values($1,$2,'test','form.pdf',true)", [
      form,
      id(),
    ]);
    await pool.query(
      "insert into policies(id,name,approved,revision_hours,referral_hours,max_alternatives,points_enabled,week_start_dow,week_cutoff) values($1,'test',true,48,48,2,true,6,'23:59:59')",
      [policy],
    );
    await pool.query(
      "insert into events(id,title,starts_at,ends_at,club_approved,summary_deadline,form_id,policy_id,department_id,status,registration_opens,registration_closes) values($1,'Test only',now()-interval '2 seconds',now()-interval '1 second',true,compute_week_deadline(now(),$3),$2,$3,$4,'published',now()-interval '1 day',now()+interval '1 day')",
      [event, form, policy, dep],
    );
    await pool.query(
      "insert into offerings values($1,'course one',$3,$4,$5,true),($2,'course two',$3,$4,$6,true)",
      [offering, offering2, dep, sem, teacher, teacher2],
    );
    await pool.query(
      "insert into enrollments values($1,$2,true),($1,$3,true)",
      [student, offering, offering2],
    );
  });
  it("anonymous readers see public events without privileged function errors", async () => {
    const c = await pool.connect();
    try {
      await c.query("begin");
      await c.query("set local role anon");
      const rows = await c.query("select id from public.events");
      expect(rows.rows.some((r) => r.id === event)).toBe(true);
      await c.query("rollback");
    } finally {
      c.release();
    }
  });
  afterAll(() => pool.end());
  it("prevents role escalation and direct table writes", async () => {
    await expect(
      as(
        student,
        "insert into roles(user_id,role,approved) values($1,'superadmin',true)",
        [student],
      ),
    ).rejects.toThrow();
    await expect(
      as(student, "select admin_action('role',$1,'escalate role')", [
        JSON.stringify({
          user_id: student,
          role: "superadmin",
          approved: true,
        }),
      ]),
    ).rejects.toThrow();
  });
  it("technical superadmin cannot make academic decisions", async () => {
    await expect(
      as(tech, "select admin_action('membership',$1,'test decision')", [
        JSON.stringify({ user_id: student, membership: "suspended" }),
      ]),
    ).rejects.toThrow();
  });
  it("attendance is required", async () => {
    await expect(
      as(student, "select begin_submission($1)", [event]),
    ).rejects.toThrow("attendance required");
  });
  it("hides another student data and unrelated instructor files", async () => {
    const { s, a } = await referred();
    expect(
      (await as(other, "select * from submissions where id=$1", [s])).rowCount,
    ).toBe(0);
    expect(
      (await as(teacher2, "select * from attachments where id=$1", [a]))
        .rowCount,
    ).toBe(0);
    expect((await as(other, "select * from storage.objects")).rowCount).toBe(0);
  });
  it("zero permits a valid different referral", async () => {
    const { s, a, r } = await referred();
    await as(teacher, "select assess($1,$2,'score',0,'needs work',$3)", [
      r,
      a,
      id(),
    ]);
    const newRef = await as(student, "select submit_referral($1,$2,$3)", [
      s,
      offering2,
      a,
    ]);
    expect(newRef.rowCount).toBe(1);
  });
  it("positive score blocks new referral and file replacement", async () => {
    const { s, a, r } = await referred();
    await as(teacher, "select assess($1,$2,'score',0.25,'accepted',$3)", [
      r,
      a,
      id(),
    ]);
    await expect(
      as(student, "select submit_referral($1,$2,$3)", [s, offering2, a]),
    ).rejects.toThrow();
    await expect(attachment(s)).rejects.toThrow();
  });
  it("concurrent duplicate referral is idempotent and alternative loses", async () => {
    const { s } = await summary();
    const a = await attachment(s);
    const results = await Promise.allSettled([
      as(student, "select submit_referral($1,$2,$3)", [s, offering, a]),
      as(student, "select submit_referral($1,$2,$3)", [s, offering2, a]),
    ]);
    expect(results.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    expect(
      (
        await pool.query(
          "select * from referrals where submission_id=$1 and active",
          [s],
        )
      ).rowCount,
    ).toBe(1);
  });
  it("concurrent assessment produces one score; retries retain receipt", async () => {
    const { a, r } = await referred();
    const request = id();
    const args = [r, a, request];
    const results = await Promise.all([
      as(teacher, "select assess($1,$2,'score',0.5,'good',$3) id", args),
      as(teacher, "select assess($1,$2,'score',0.5,'good',$3) id", args),
    ]);
    expect(results[0].rows[0].id).toBe(results[1].rows[0].id);
    expect(
      (await pool.query("select * from assessments where referral_id=$1", [r]))
        .rowCount,
    ).toBe(1);
  });
  it("revision remains with instructor and rejects stale version", async () => {
    const { s, a, r } = await referred();
    await as(teacher, "select assess($1,$2,'revision',null,'revise page',$3)", [
      r,
      a,
      id(),
    ]);
    const next = await attachment(s);
    await expect(
      as(student, "select submit_referral($1,$2,$3)", [s, offering2, next]),
    ).rejects.toThrow();
    await as(student, "select submit_referral($1,$2,$3)", [s, offering, next]);
    await expect(
      as(teacher, "select assess($1,$2,'score',1,'stale',$3)", [r, a, id()]),
    ).rejects.toThrow("stale");
    await as(teacher, "select assess($1,$2,'score',1,'new version',$3)", [
      r,
      next,
      id(),
    ]);
    expect(
      (
        await pool.query("select * from attachments where submission_id=$1", [
          s,
        ])
      ).rowCount,
    ).toBe(2);
  });
  it("appeal and audited correction never unlock positive credit", async () => {
    const { s, a, r } = await referred();
    await as(teacher, "select assess($1,$2,'score',0.7,'accepted',$3)", [
      r,
      a,
      id(),
    ]);
    await as(
      student,
      "select open_appeal($1,'review request','Please review the assessment')",
      [s],
    );
    await as(
      admin,
      "select admin_action('correction',$1,'Documented academic dispute')",
      [JSON.stringify({ id: s, state: "administrative_review" })],
    );
    expect(
      (
        await pool.query(
          "select positive_locked from submissions where id=$1",
          [s],
        )
      ).rows[0].positive_locked,
    ).toBe(true);
    expect(
      (
        await pool.query(
          "select * from audit where entity='submissions' and entity_id=$1 and reason='Documented academic dispute'",
          [s],
        )
      ).rowCount,
    ).toBe(1);
  });
  it("revoked membership removes private file access", async () => {
    const { a } = await referred();
    await pool.query("update profiles set membership='suspended' where id=$1", [
      student,
    ]);
    expect(
      (await as(student, "select * from attachments where id=$1", [a]))
        .rowCount,
    ).toBe(0);
    await pool.query("update profiles set membership='approved' where id=$1", [
      student,
    ]);
  });
  it("rejects expired deadlines", async () => {
    const { s } = await summary();
    await pool.query(
      "update submissions set deadline_snapshot=now()-interval '1 second' where id=$1",
      [s],
    );
    await expect(attachment(s)).rejects.toThrow("deadline");
  });
  it("points deduplicate and invalidation reverses once", async () => {
    await pool.query(
      "insert into points_rules(activity,points,approved) values('attendance',3,true) on conflict(activity) do nothing",
    );
    const { s, ev } = await summary();
    await Promise.all([
      as(student, "select sync_points($1,$2)", [ev, student]),
      as(student, "select sync_points($1,$2)", [ev, student]),
    ]);
    expect(
      Number(
        (
          await pool.query(
            "select sum(points) total from points_ledger where source_id=$1",
            [ev],
          )
        ).rows[0].total,
      ),
    ).toBe(3);
    await as(
      admin,
      "select admin_action('correction',$1,'Invalidated attendance evidence')",
      [JSON.stringify({ id: s, state: "invalidated" })],
    );
    expect(
      Number(
        (
          await pool.query(
            "select sum(points) total from points_ledger where source_id=$1",
            [ev],
          )
        ).rows[0].total,
      ),
    ).toBe(0);
  });
  it("abandoned uploads cannot be finalized or claimed by a student", async () => {
    const { s } = await summary();
    const a = id();
    await as(student, "select add_attachment($1,$2,'image/jpeg',100,$3)", [
      s,
      a,
      "b".repeat(64),
    ]);
    await pool.query(
      "update attachments set created_at=now()-interval '2 days' where id=$1",
      [a],
    );
    await expect(
      as(student, "select * from claim_abandoned_uploads()"),
    ).rejects.toThrow();
    const claimed = await pool.query("select * from claim_abandoned_uploads()");
    expect(claimed.rows.some((x) => x.id === a)).toBe(true);
    await expect(
      pool.query("select finalize_attachment($1,$2,true)", [a, "b".repeat(64)]),
    ).rejects.toThrow("unavailable");
  });
  it("database computes Friday cutoff in the named Tehran timezone", async () => {
    const r = await pool.query(
      "select compute_week_deadline('2026-11-07T00:00:00+03:30',$1) deadline",
      [policy],
    );
    expect(r.rows[0].deadline.toISOString()).toBe("2026-11-13T20:29:59.000Z");
  });

  it("deadline exceptions preserve history and reject technical authority", async () => {
    const { s } = await summary();
    const target = new Date(Date.now() + 14 * 86400000).toISOString();
    await expect(
      as(tech, "select extend_submission_deadline($1,$2,$3)", [
        s,
        target,
        "Technical override denied",
      ]),
    ).rejects.toThrow();
    await as(admin, "select extend_submission_deadline($1,$2,$3)", [
      s,
      target,
      "Approved documented exception",
    ]);
    expect(
      (
        await as(
          student,
          "select * from deadline_exceptions where submission_id=$1",
          [s],
        )
      ).rowCount,
    ).toBe(1);
  });
  it("late zero file replacement uses approved referral grace", async () => {
    const { s, a, r } = await referred();
    await as(teacher, "select assess($1,$2,'score',0,'late zero',$3)", [
      r,
      a,
      id(),
    ]);
    await pool.query(
      "update submissions set deadline_snapshot=now()-interval '1 hour' where id=$1",
      [s],
    );
    const next = await attachment(s);
    expect(next).toBeTruthy();
    await as(student, "select submit_referral($1,$2,$3)", [s, offering2, next]);
  });
  it("manual participation adjustment is audited and deduplicated", async () => {
    const request = id();
    await as(admin, "select adjust_points($1,$2,2,$3,$4)", [
      student,
      sem,
      request,
      "Approved participation correction",
    ]);
    await as(admin, "select adjust_points($1,$2,2,$3,$4)", [
      student,
      sem,
      request,
      "Approved participation correction",
    ]);
    expect(
      (
        await pool.query("select * from points_ledger where source_id=$1", [
          request,
        ])
      ).rowCount,
    ).toBe(1);
  });

  it("editorial metadata is scoped, auditable and unpublished records stay private", async () => {
    const contentId = id();
    const payload = {
      id: contentId,
      kind: "event_archive",
      title: "Test archive",
      description: "Isolated test record",
      department_id: dep,
      status: "published",
      editorial: {
        year: "1404-1405",
        image: "/assets/official/news-50799-1.webp",
        order: 1,
      },
    };
    await as(
      admin,
      "select admin_action('content',$1::jsonb,'Approved editorial test')",
      [JSON.stringify(payload)],
    );
    expect(
      (
        await pool.query("select editorial from content where id=$1", [
          contentId,
        ])
      ).rows[0].editorial.year,
    ).toBe("1404-1405");
    await expect(
      as(
        student,
        "select admin_action('content',$1::jsonb,'Unauthorized edit attempt')",
        [JSON.stringify(payload)],
      ),
    ).rejects.toThrow();
    await as(
      admin,
      "select admin_action('content',$1::jsonb,'Unpublish editorial test')",
      [JSON.stringify({ ...payload, status: "draft" })],
    );
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("set local role anon");
      expect(
        (await client.query("select id from content where id=$1", [contentId]))
          .rowCount,
      ).toBe(0);
      await client.query("rollback");
    } finally {
      client.release();
    }
  });
});
