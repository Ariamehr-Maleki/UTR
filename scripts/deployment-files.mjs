import fs from "node:fs";
import path from "node:path";
const files = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else
      files.push({
        file: p.replaceAll("\\", "/"),
        data: fs
          .readFileSync(p)
          .toString(p.endsWith(".png") ? "base64" : "utf8"),
        encoding: p.endsWith(".png") ? "base64" : "utf-8",
      });
  }
}
walk("src");
walk("public");
for (const p of [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tsconfig.json",
  "next-env.d.ts",
])
  files.push({ file: p, data: fs.readFileSync(p, "utf8"), encoding: "utf-8" });
console.log(JSON.stringify(files));
