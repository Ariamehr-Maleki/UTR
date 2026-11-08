import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import pg from "pg";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import { chromium, request, expect } from "@playwright/test";
const origin = "http://127.0.0.1:3113";
if (
  process.env.APP_ORIGIN !== origin ||
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:54321" ||
  process.env.UTR_LOCAL_INTEGRATION !== "true"
)
  throw Error("This suite is restricted to the isolated loopback stack");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const contexts = [];
let browser;
const id = () => randomUUID();
let stage = "fixtures";
async function actor(kind) {
  const email = `integration-${kind}-${id()}@example.com`,
    password = id() + id();
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.equal(created.error, null, "Create isolated account");
  const api = await request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { origin },
  });
  contexts.push(api);
  const login = await api.post("/api/auth", {
    data: { mode: "login", email, password },
  });
  assert.equal(login.status(), 200, "Real HTTP login");
  return { id: created.data.user.id, api };
}
async function action(actor, name, data, status = 200) {
  const response = await actor.api.post("/api/action", {
    data: { action: name, data },
  });
  assert.equal(response.status(), status, `${stage}: ${name} response`);
  return await response.json();
}
try {
  const [student, other, teacher, teacher2, academic, technical] =
    await Promise.all([
      actor("student"),
      actor("other"),
      actor("teacher"),
      actor("teacher2"),
      actor("academic"),
      actor("technical"),
    ]);
  const dep = id(),
    semester = id(),
    form = id(),
    policy = id(),
    event = id(),
    offering = id(),
    offering2 = id();
  await db.query(
    "insert into departments(id,name) values($1,'گروه آزمایشی؛ فقط آزمون یکپارچه')",
    [dep],
  );
  for (const [a, name] of [
    [student, "دانشجوی آزمایشی"],
    [other, "دانشجوی دیگر آزمایشی"],
    [teacher, "استاد اول آزمایشی"],
    [teacher2, "استاد دوم آزمایشی"],
    [academic, "مسئول پژوهشی آزمایشی"],
    [technical, "مدیر فنی آزمایشی"],
  ]) {
    await db.query(
      "update profiles set display_name=$2,membership='approved',department_id=$3,student_number=$4,degree='bachelor' where id=$1",
      [a.id, name, dep, `TEST-${a.id}`],
    );
    await db.query(
      "update roles set approved=$2 where user_id=$1 and role='student'",
      [a.id, [student.id, other.id].includes(a.id)],
    );
  }
  for (const [a, role, scope] of [
    [teacher, "instructor", dep],
    [teacher2, "instructor", dep],
    [academic, "admin", dep],
    [technical, "superadmin", null],
  ])
    await db.query(
      "insert into roles(user_id,role,department_id,approved) values($1,$2,$3,true)",
      [a.id, role, scope],
    );
  await db.query(
    "insert into semesters values($1,'نیمسال آزمایشی',current_date-30,current_date+30)",
    [semester],
  );
  const pdf = await PDFDocument.create();
  pdf.addPage().drawText("INTEGRATION TEST ONLY - NOT AN OFFICIAL FORM");
  assert.equal(
    (
      await service.storage
        .from("forms")
        .upload("integration/form.pdf", await pdf.save(), {
          contentType: "application/pdf",
        })
    ).error,
    null,
  );
  await db.query(
    "insert into forms values($1,$2,'فرم فقط برای آزمون','integration/form.pdf',true)",
    [form, id()],
  );
  await db.query(
    "insert into policies(id,name,approved,revision_hours,referral_hours,max_alternatives,review_hours,week_start_dow,week_cutoff) values($1,'سیاست فقط برای آزمون',true,48,48,2,24,6,'23:59:59')",
    [policy],
  );
  await db.query(
    "insert into events(id,title,starts_at,ends_at,club_approved,summary_deadline,form_id,policy_id,department_id,status,registration_opens,registration_closes) values($1,'نشست آزمایشی برای بررسی کامل مسیر خلاصه و ارزیابی دانشگاهی',now()-interval '2 hours',now()-interval '1 hour',true,compute_week_deadline(now(),$3),$2,$3,$4,'published',now()-interval '2 days',now()+interval '1 day')",
    [event, form, policy, dep],
  );
  await db.query(
    "insert into offerings values($1,'درس اول آزمایشی',$3,$4,$5,true),($2,'درس دوم آزمایشی',$3,$4,$6,true)",
    [offering, offering2, dep, semester, teacher.id, teacher2.id],
  );
  await db.query("insert into enrollments values($1,$2,true),($1,$3,true)", [
    student.id,
    offering,
    offering2,
  ]);
  await db.query("insert into event_offerings values($1,$2),($1,$3)", [
    event,
    offering,
    offering2,
  ]);
  stage = "roles and attendance";
  assert.equal(
    (await student.api.post("/api/role", { data: { role: "admin" } })).status(),
    403,
  );
  for (const [a, role] of [
    [student, "student"],
    [teacher, "instructor"],
    [academic, "admin"],
    [technical, "superadmin"],
  ])
    assert.equal(
      (await a.api.post("/api/role", { data: { role } })).status(),
      200,
    );
  await action(student, "begin", { event_id: event }, 409);
  await action(
    technical,
    "admin",
    {
      operation: "membership",
      payload: JSON.stringify({ user_id: student.id, membership: "suspended" }),
      reason: "Forbidden technical academic decision",
    },
    409,
  );
  await action(academic, "admin", {
    operation: "attendance",
    payload: JSON.stringify({
      event_id: event,
      user_id: student.id,
      confirmed: true,
    }),
    reason: "Integration staff confirmed attendance",
  });
  await action(other, "begin", { event_id: event }, 409);
  const beginnings = await Promise.all(
    [1, 2, 3].map(() => action(student, "begin", { event_id: event })),
  );
  const submission = beginnings[0].id;
  assert.ok(submission);
  assert.ok(beginnings.every((r) => r.id === submission));
  stage = "private upload and retry";
  const image = await sharp({
    create: { width: 1000, height: 1400, channels: 3, background: "white" },
  })
    .jpeg()
    .toBuffer();
  async function upload(attachment, buffer = image, status = 200) {
    const response = await student.api.post("/api/upload", {
      multipart: {
        submission_id: submission,
        attachment_id: attachment,
        file: { name: "summary.jpg", mimeType: "image/jpeg", buffer },
      },
    });
    assert.equal(response.status(), status, `${stage}: upload`);
    return response;
  }
  const first = id();
  await upload(first, Buffer.from("invalid file"), 400);
  await upload(first);
  await upload(first);
  assert.equal(
    (
      await db.query(
        "select count(*)::int n from attachments where submission_id=$1",
        [submission],
      )
    ).rows[0].n,
    1,
  );
  const formDownload = await student.api.get(`/api/form/${form}`);
  assert.equal(formDownload.status(), 200);
  const referrals = await Promise.all(
    [1, 2].map(() =>
      action(student, "refer", {
        submission_id: submission,
        offering_id: offering,
        attachment_id: first,
      }),
    ),
  );
  const referral = referrals[0].id;
  assert.equal(referral, referrals[1].id);
  assert.equal((await student.api.get(`/api/file/${first}`)).status(), 200);
  assert.equal((await teacher.api.get(`/api/file/${first}`)).status(), 200);
  assert.equal((await teacher2.api.get(`/api/file/${first}`)).status(), 404);
  assert.equal((await other.api.get(`/api/file/${first}`)).status(), 404);
  const publicFile = await fetch(
    `http://127.0.0.1:54321/storage/v1/object/public/summaries/${student.id}/${submission}/${first}`,
  );
  assert.ok(!publicFile.ok);
  stage = "real workspace rendering";
  browser = await chromium.launch();
  await fs.mkdir(".impeccable/review/integration", { recursive: true });
  for (const [a, role, path] of [
    [student, "student", "/workspace"],
    [teacher, "instructor", "/workspace/instructor"],
    [academic, "admin", "/workspace/administration"],
    [technical, "technical", "/workspace/technical"],
  ]) {
    const context = await browser.newContext({
      storageState: await a.api.storageState(),
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      const response = await page.goto(origin + path);
      assert.equal(response.status(), 200);
      await expect(page.locator(".workspace-v2 > section > h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${role} overflow ${width}`,
      );
      await page.screenshot({
        path: `.impeccable/review/integration/${role}-${width}.png`,
        fullPage: true,
      });
    }
    if (role === "instructor") {
      await page.goto(origin + "/workspace/review");
      await expect(
        page.getByText("درس اول آزمایشی", { exact: true }),
      ).toBeVisible();
    }
    if (role === "admin") {
      await page.goto(origin + "/workspace/admin?operation=attendance");
      await expect(
        page.getByRole("button", { name: "ثبت تغییر", exact: true }),
      ).toBeVisible();
      await page.goto(origin + "/workspace/admin?operation=event");
      await expect(
        page.getByRole("heading", { name: "مسیر انتشار نخستین رویداد" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "۴ · بازبینی و انتشار" }),
      ).toBeVisible();
      await expect(
        page.locator('.admin-event-form input[name="id"]'),
      ).toHaveAttribute("type", "hidden");
      await page.screenshot({
        path: ".impeccable/review/integration/admin-event-setup-1440.png",
        fullPage: true,
      });
    }
    await context.close();
  }
  stage = "revision and exact attachment version";
  await action(teacher, "assess", {
    referral_id: referral,
    attachment_id: first,
    outcome: "revision",
    feedback: "Please improve legibility",
    request_id: id(),
  });
  const second = id();
  await upload(second);
  await action(student, "refer", {
    submission_id: submission,
    offering_id: offering,
    attachment_id: second,
  });
  await action(
    teacher,
    "assess",
    {
      referral_id: referral,
      attachment_id: first,
      outcome: "score",
      score: "1",
      confirm: "true",
      feedback: "stale version",
      request_id: id(),
    },
    409,
  );
  stage = "zero then positive grading";
  await action(teacher, "assess", {
    referral_id: referral,
    attachment_id: second,
    outcome: "score",
    score: "0",
    feedback: "Zero assessment for test",
    request_id: id(),
  });
  const next = await action(student, "refer", {
    submission_id: submission,
    offering_id: offering2,
    attachment_id: second,
  });
  assert.equal((await teacher2.api.get(`/api/file/${second}`)).status(), 200);
  const decision = {
    referral_id: next.id,
    attachment_id: second,
    outcome: "score",
    score: "0.25",
    confirm: "true",
    feedback: "Positive fractional assessment",
    request_id: id(),
  };
  await Promise.all([
    action(teacher2, "assess", decision),
    action(teacher2, "assess", decision),
  ]);
  await action(
    student,
    "refer",
    { submission_id: submission, offering_id: offering, attachment_id: second },
    409,
  );
  await upload(id(), image, 409);
  const state = (
    await db.query(
      "select state,positive_locked from submissions where id=$1",
      [submission],
    )
  ).rows[0];
  assert.equal(state.positive_locked, true);
  await action(student, "appeal", {
    submission_id: submission,
    subject: "Test academic appeal",
    body: "Please review the recorded outcome and retain its history.",
  });
  await action(
    student,
    "refer",
    { submission_id: submission, offering_id: offering, attachment_id: second },
    409,
  );
  stage = "revocation and logout";
  await db.query(
    "update roles set approved=false where user_id=$1 and role='instructor'",
    [teacher2.id],
  );
  assert.equal((await teacher2.api.get(`/api/file/${second}`)).status(), 404);
  assert.equal(
    (
      await teacher2.api.post("/api/role", { data: { role: "instructor" } })
    ).status(),
    403,
  );
  await action(student, "logout", {});
  assert.equal((await student.api.get(`/api/file/${second}`)).status(), 401);
  const loggedOutContext = await browser.newContext({
    storageState: await student.api.storageState(),
  });
  const loggedOutPage = await loggedOutContext.newPage();
  await loggedOutPage.goto(origin + "/workspace/profile");
  await expect(loggedOutPage).toHaveURL(origin + "/auth/login");
  await loggedOutContext.close();
  console.log(
    "PASS: isolated real Auth + SSR + private Storage + staff attendance + canonical/concurrent retries + revision versions + zero referral + positive lock + appeal lock + revoked permissions + logout + four responsive workspaces",
  );
} catch (error) {
  console.error(`FAIL at ${stage}: ${error.message}`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  for (const context of contexts) await context.dispose();
  await db.end();
}
