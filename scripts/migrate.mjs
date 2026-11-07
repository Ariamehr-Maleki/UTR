import fs from "node:fs";
import { createHash } from "node:crypto";
import pg from "pg";
if (!process.env.DATABASE_URL)
  throw Error(
    "Set DATABASE_URL securely; do not pass a password as an argument.",
  );
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
try {
  await c.query("select pg_advisory_lock(hashtext('utr-migrations'))");
  await c.query("create schema if not exists utr_internal");
  await c.query("revoke all on schema utr_internal from public");
  await c.query(
    "create table if not exists utr_internal.migrations(name text primary key,sha256 text not null,applied_at timestamptz default now())",
  );
  for (const file of fs
    .readdirSync("supabase/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    const sql = fs.readFileSync("supabase/migrations/" + file, "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    const previous = await c.query(
      "select sha256 from utr_internal.migrations where name=$1",
      [file],
    );
    if (previous.rowCount) {
      if (previous.rows[0].sha256 !== hash)
        throw Error("Applied migration checksum mismatch: " + file);
      continue;
    }
    await c.query("begin");
    try {
      await c.query(sql.replace(/^begin;\s*/i, "").replace(/commit;\s*$/i, ""));
      await c.query(
        "insert into utr_internal.migrations(name,sha256) values($1,$2)",
        [file, hash],
      );
      await c.query("commit");
      console.log("Applied " + file);
    } catch (e) {
      await c.query("rollback");
      throw e;
    }
  }
} finally {
  await c.end();
}
