import pg from "pg";
const uid = process.env.BOOTSTRAP_USER_ID;
if (!/^[a-f0-9-]{36}$/i.test(uid || "") || !process.env.DATABASE_URL)
  throw Error(
    "Secure DATABASE_URL and verified BOOTSTRAP_USER_ID are required.",
  );
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
try {
  await c.query("begin");
  await c.query("select pg_advisory_xact_lock(hashtext('utr-bootstrap'))");
  if (
    (
      await c.query(
        "select 1 from public.roles where role='superadmin' and approved",
      )
    ).rowCount
  )
    throw Error("Superadmin already initialized.");
  const user = await c.query(
    "select id from auth.users where id=$1 and email_confirmed_at is not null",
    [uid],
  );
  if (!user.rowCount) throw Error("Verified Auth account required.");
  await c.query(
    "select set_config('utr.reason','Explicit first technical superadmin bootstrap',true)",
  );
  await c.query(
    "update public.profiles set membership='approved' where id=$1",
    [uid],
  );
  await c.query(
    "insert into public.roles(user_id,role,approved) values($1,'superadmin',true)",
    [uid],
  );
  await c.query("commit");
  console.log(
    "Technical superadmin initialized. No academic admin authority was granted.",
  );
} catch (e) {
  await c.query("rollback");
  throw e;
} finally {
  await c.end();
}
