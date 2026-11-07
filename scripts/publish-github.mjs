// Uses the host credential manager through gh; never reads or prints tokens.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const repo = "Ariamehr-Maleki/UTR",
  branch = "codex/utr-platform";
const api = (endpoint, body) => {
  const args = ["api", `repos/${repo}/${endpoint}`];
  if (body) {
    const file = path.resolve("../github-request.json");
    fs.writeFileSync(file, JSON.stringify(body));
    args.push("--method", "POST", "--input", file);
  }
  return JSON.parse(
    execFileSync("gh", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
  );
};
const head = api(`git/ref/heads/${branch}`).object.sha;
const entries = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else add(p);
  }
}
function add(p) {
  const file = p.replaceAll("\\", "/");
  const bytes = fs.readFileSync(p);
  if (p.endsWith(".png")) {
    const blob = api("git/blobs", {
      content: bytes.toString("base64"),
      encoding: "base64",
    });
    entries.push({ path: file, mode: "100644", type: "blob", sha: blob.sha });
  } else
    entries.push({
      path: file,
      mode: "100644",
      type: "blob",
      content: bytes.toString("utf8"),
    });
}
for (const d of ["src", "public", "supabase", "tests", "scripts"]) walk(d);
for (const f of fs.readdirSync("."))
  if (
    fs.statSync(f).isFile() &&
    !f.startsWith(".env") &&
    !f.endsWith(".tsbuildinfo") &&
    [".json", ".md", ".ts"].some((ext) => f.endsWith(ext))
  )
    add(f);
for (const f of [".gitignore", ".gitattributes", ".env.example"]) add(f);
if (fs.existsSync(".github")) walk(".github");
if (fs.existsSync(".impeccable/design.json")) add(".impeccable/design.json");
const tree = api("git/trees", { tree: entries });
const commit = api("git/commits", {
  message:
    "feat: implement UTR research workflows, private storage and scoped administration",
  tree: tree.sha,
  parents: [head],
});
const current = api(`git/ref/heads/${branch}`).object.sha;
if (current !== head) throw Error("Remote branch changed; refusing update");
const file = path.resolve("../github-ref.json");
fs.writeFileSync(file, JSON.stringify({ sha: commit.sha, force: false }));
execFileSync(
  "gh",
  [
    "api",
    `repos/${repo}/git/refs/heads/${branch}`,
    "--method",
    "PATCH",
    "--input",
    file,
  ],
  { stdio: "ignore" },
);
console.log(
  JSON.stringify({
    branch,
    commit: commit.sha,
    url: `https://github.com/${repo}/commit/${commit.sha}`,
  }),
);
