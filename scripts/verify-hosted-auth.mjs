// Temporary, explicitly named auth probes only; never creates academic records.
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !secret || process.env.UTR_AUTH_SMOKE_APPROVED !== "true")
  throw Error(
    "Explicit auth-only smoke opt-in and secure environment required",
  );
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secret, options);
const clients = [
  createClient(url, key, options),
  createClient(url, key, options),
];
const users = [];
try {
  for (const client of clients) {
    const email = `utr-smoke-${randomUUID()}@example.com`;
    const password = randomUUID() + randomUUID();
    const result = await client.auth.signUp({ email, password });
    assert.equal(result.error, null, "Registration must succeed");
    const user = result.data.user;
    if (user) users.push(user);
    assert.ok(
      result.data.session,
      "Confirmation-free signup must return a session",
    );
    const profile = await client
      .from("profiles")
      .select("id,membership")
      .eq("id", user.id)
      .single();
    assert.equal(profile.error, null);
    assert.equal(profile.data.membership, "pending");
    assert.equal(
      (await client.rpc("has_role", { wanted: "superadmin" })).data,
      false,
    );
    assert.equal(
      (await client.rpc("has_role", { wanted: "student" })).data,
      false,
    );
    const escalation = await client
      .from("roles")
      .insert({ user_id: user.id, role: "superadmin", approved: true });
    assert.ok(escalation.error, "Self-granted administrative roles must fail");
    assert.ok(
      (
        await client
          .from("profiles")
          .update({ membership: "approved" })
          .eq("id", user.id)
      ).error,
    );
    const listing = await client.storage.from("summaries").list(user.id);
    assert.ok(listing.error || listing.data.length === 0);
    await client.auth.signOut();
    assert.ok(
      (await client.auth.signInWithPassword({ email, password })).data.session,
    );
  }
  const another = await clients[0]
    .from("profiles")
    .select("id")
    .eq("id", users[1].id);
  assert.equal(another.error, null);
  assert.deepEqual(another.data, [], "Student must not read another profile");
  for (const client of clients) {
    await client.auth.signOut();
    assert.equal((await client.auth.getUser()).data.user, null);
    assert.ok(
      (
        await client.storage
          .from("summaries")
          .upload(`${randomUUID()}/probe`, new Uint8Array([1]))
      ).error,
    );
  }
  console.log(
    "PASS: real signup/session, pending membership, login/logout, profile isolation, role escalation, private storage denial",
  );
} finally {
  for (const client of clients) await client.auth.signOut();
  for (const user of users) {
    assert.ok(user.email.startsWith("utr-smoke-"));
    for (const table of ["roles", "profiles"]) {
      const result = await admin
        .from(table)
        .delete()
        .eq(table === "roles" ? "user_id" : "id", user.id);
      assert.equal(result.error, null, "Temporary auth probe cleanup failed");
    }
    assert.equal((await admin.auth.admin.deleteUser(user.id)).error, null);
  }
  console.log("Temporary accounts removed; no academic records created.");
}
