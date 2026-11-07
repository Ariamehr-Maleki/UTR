import fs from "node:fs";
import { createHash } from "node:crypto";
let sql =
  "begin;\nselect pg_advisory_xact_lock(hashtext('utr-migrations'));\ncreate schema if not exists utr_internal;\nrevoke all on schema utr_internal from public;\ncreate table if not exists utr_internal.migrations(name text primary key,sha256 text not null,applied_at timestamptz default now());\n";
for (const name of fs
  .readdirSync("supabase/migrations")
  .filter((x) => x.endsWith(".sql"))
  .sort()) {
  const source = fs.readFileSync("supabase/migrations/" + name, "utf8");
  const hash = createHash("sha256").update(source).digest("hex");
  sql +=
    `\n-- ${name}\n` +
    source.replace(/^begin;\s*/i, "").replace(/commit;\s*$/i, "") +
    `\ninsert into utr_internal.migrations(name,sha256) values('${name}','${hash}');\n`;
}
sql +=
  "commit;\nselect count(*) as applied_migrations from utr_internal.migrations;\n";
fs.writeFileSync("../utr-release.sql", sql);
console.log("Generated atomic SQL release in work/utr-release.sql");
