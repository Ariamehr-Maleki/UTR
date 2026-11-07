import pg from "pg";
const uid = process.env.BOOTSTRAP_ACADEMIC_USER_ID;
const reason = process.env.UTR_INSTITUTIONAL_APPROVAL_REASON;
if (
  !/^[a-f0-9-]{36}$/i.test(uid || "") ||
  !process.env.DATABASE_URL ||
  !reason ||
  reason.trim().length < 20
)
  throw Error(
    "Verified academic account UUID, secure DATABASE_URL and explicit institutional approval reason required.",
  );
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
try {
  await c.query("begin");
  await c.query(
    "select pg_advisory_xact_lock(hashtext('utr-academic-bootstrap'))",
  );
  if (
    (
      await c.query(
        "select 1 from roles where role='admin' and approved and department_id is null",
      )
    ).rowCount
  )
    throw Error(
      "A global academic administrator already exists; use normal audited administration.",
    );
  if (
    !(
      await c.query(
        "select id from auth.users where id=$1 and email_confirmed_at is not null",
        [uid],
      )
    ).rowCount
  )
    throw Error("Verified Auth account required.");
  await c.query("select set_config('utr.reason',$1,true)", [reason]);
  await c.query("update profiles set membership='approved' where id=$1", [uid]);
  await c.query(
    "insert into roles(user_id,role,approved) values($1,'admin',true)",
    [uid],
  );
  await c.query("commit");
  console.log("First institution-approved academic administrator initialized.");
} catch (e) {
  await c.query("rollback");
  throw e;
} finally {
  await c.end();
}
