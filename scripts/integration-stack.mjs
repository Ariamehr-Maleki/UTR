// Runs only an ephemeral loopback stack. Never reads hosted project credentials.
import fs from "node:fs";
import { execFileSync, spawn } from "node:child_process";
const run = (command, args, env = process.env) =>
  execFileSync(command, args, { stdio: "inherit", env });
if (process.platform === "win32")
  throw Error("Run this container acceptance suite on a Linux runner.");
fs.mkdirSync(".integration", { recursive: true });
run("npx", [
  "--yes",
  "supabase@3.0.0",
  "init",
  "--workdir",
  ".integration",
  "--yes",
]);
const configPath = ".integration/supabase/config.toml";
let config = fs
  .readFileSync(configPath, "utf8")
  .replace(/^project_id = .*$/m, 'project_id = "utr-integration"')
  .replace(/^site_url = .*$/m, 'site_url = "http://127.0.0.1:3113"')
  .replace(
    /^additional_redirect_urls = .*$/m,
    'additional_redirect_urls = ["http://127.0.0.1:3113/auth/callback"]',
  )
  .replace(/^enable_confirmations = true$/m, "enable_confirmations = false");
fs.writeFileSync(configPath, config);
let server;
try {
  // Startup/status can include local development keys; capture, never print them.
  execFileSync(
    "npx",
    [
      "--yes",
      "supabase@3.0.0",
      "start",
      "--workdir",
      ".integration",
      "--exclude",
      "realtime,imgproxy,studio,edge-runtime,logflare,vector,supavisor",
    ],
    { stdio: ["ignore", "pipe", "pipe"], timeout: 600000 },
  );
  const status = JSON.parse(
    execFileSync(
      "npx",
      [
        "--yes",
        "supabase@3.0.0",
        "status",
        "--workdir",
        ".integration",
        "--output",
        "json",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ),
  );
  if (
    status.API_URL !== "http://127.0.0.1:54321" ||
    !status.SERVICE_ROLE_KEY ||
    !status.ANON_KEY ||
    !status.DB_URL
  )
    throw Error(
      `Unexpected local status fields: ${Object.keys(status).join(",")}`,
    );
  const env = {
    ...process.env,
    VERCEL_ENV: "",
    UTR_LOCAL_INTEGRATION: "true",
    UTR_LIVE_ENABLED: "true",
    UTR_ACCOUNTS_ENABLED: "true",
    UTR_SIGNUP_ENABLED: "true",
    UTR_AUTH_EMAIL_ENABLED: "false",
    APP_ORIGIN: "http://127.0.0.1:3113",
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    DATABASE_URL: status.DB_URL,
  };
  run("node", ["scripts/migrate.mjs"], env);
  run("npm", ["run", "build"], env);
  server = spawn(
    "node",
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3113",
    ],
    { env, stdio: "inherit" },
  );
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(env.APP_ORIGIN)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!ready) throw Error("Integration app did not start");
  run("node", ["scripts/verify-integrated-workflow.mjs"], env);
} catch (error) {
  // execFile errors may embed captured stdout with local keys. Never serialize the error object.
  console.error(
    "Isolated stack acceptance failed:",
    error instanceof Error ? error.message.split("\n")[0] : "unknown error",
  );
  process.exitCode = 1;
} finally {
  server?.kill("SIGTERM");
  try {
    execFileSync(
      "npx",
      [
        "--yes",
        "supabase@3.0.0",
        "stop",
        "--workdir",
        ".integration",
        "--no-backup",
      ],
      { stdio: ["ignore", "pipe", "pipe"], timeout: 90000 },
    );
  } catch {
    console.error("Local container cleanup needs attention");
  }
}
