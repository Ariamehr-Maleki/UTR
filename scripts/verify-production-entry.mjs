// Auth-only, temporary production probe. Never creates academic fixtures or grants roles.
// Credential is passed on stdin and never logged or persisted.
import { createClient } from "@supabase/supabase-js";
import { request, chromium, expect } from "@playwright/test";
import { randomUUID, createHash } from "node:crypto";
import assert from "node:assert/strict";
let credential = "";
for await (const chunk of process.stdin) credential += chunk;
const service = createClient(
  "https://spqtwgyxzdythfmyzvyh.supabase.co",
  credential.trim(),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
credential = "";
const origin = "https://utr-farabi.vercel.app";
const email = `utr-launch-probe-${randomUUID()}@example.test`,
  password = randomUUID() + randomUUID();
const api = await request.newContext({
  baseURL: origin,
  extraHTTPHeaders: { origin },
});
let user, browser;
try {
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) throw Error("Temporary Auth probe creation failed");
  user = created.data.user;
  assert.equal(
    (
      await api.post("/api/auth", { data: { mode: "login", email, password } })
    ).status(),
    200,
    "Hosted SSR login",
  );
  assert.equal(
    (await api.post("/api/role", { data: { role: "admin" } })).status(),
    403,
    "Pending account cannot select administration",
  );
  assert.equal(
    (
      await api.post("/api/action", {
        data: { action: "begin", data: { event_id: randomUUID() } },
      })
    ).status(),
    409,
    "Live workflow gate reached; unauthorized event refused",
  );
  const file = await api.get("/api/form/8b212bbb-c5f4-4797-bd57-9682f5610d81");
  assert.equal(
    file.status(),
    200,
    "Hosted private form via authenticated server",
  );
  assert.equal(
    createHash("sha256")
      .update(await file.body())
      .digest("hex"),
    "70db67350831a2a466b94cedae5ea49c5b7d2a7e92a3527443c0a95b8de6e30e",
  );
  browser = await chromium.launch({
    channel: process.platform === "win32" ? "msedge" : undefined,
  });
  const context = await browser.newContext({
    storageState: await api.storageState(),
  });
  const page = await context.newPage();
  await page.goto(origin + "/workspace/profile");
  await expect(page.locator('input[name="display_name"]')).toBeVisible();
  assert.equal(
    (
      await api.post("/api/action", { data: { action: "logout", data: {} } })
    ).status(),
    200,
  );
  assert.equal(
    (await api.get("/api/form/8b212bbb-c5f4-4797-bd57-9682f5610d81")).status(),
    401,
    "Form denied after logout",
  );
  console.log(
    "PASS production SSR login, private approved form hash, live authorization, role denial, profile render and logout. No academic fixtures created.",
  );
} finally {
  await browser?.close();
  await api.dispose();
  if (user) {
    assert.ok(
      user.email.startsWith("utr-launch-probe-") &&
        user.email.endsWith("@example.test"),
    );
    for (const table of ["roles", "profiles"]) {
      const cleaned = await service
        .from(table)
        .delete()
        .eq(table === "roles" ? "user_id" : "id", user.id);
      if (cleaned.error) throw Error("Temporary probe profile cleanup failed");
    }
    const result = await service.auth.admin.deleteUser(user.id);
    if (result.error) throw Error("Temporary Auth probe cleanup failed");
    console.log("Temporary Auth probe removed.");
  }
}
