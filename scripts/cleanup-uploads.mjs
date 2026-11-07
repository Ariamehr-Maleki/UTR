import { createClient } from "@supabase/supabase-js";
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw Error("Secure service environment required.");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
if (process.env.UTR_CLEANUP_APPLY !== "true") {
  const { count, error } = await db
    .from("attachments")
    .select("id", { count: "exact", head: true })
    .eq("safety", "pending")
    .lt("created_at", new Date(Date.now() - 86400000).toISOString());
  if (error) throw Error("Could not list candidates");
  console.log(
    "Old pending uploads (eligibility checked transactionally on apply): " +
      count,
  );
} else {
  const claimed = await db.rpc("claim_abandoned_uploads");
  if (claimed.error) throw Error("Could not claim abandoned uploads");
  // Retry all rejected objects as well: this recovers failed storage deletion.
  const rejected = await db
    .from("attachments")
    .select("id,object_path,original_path")
    .eq("safety", "rejected");
  if (rejected.error) throw Error("Could not list rejected uploads");
  for (const a of rejected.data || []) {
    const { error } = await db.storage
      .from("summaries")
      .remove([a.object_path, a.original_path].filter(Boolean));
    if (error)
      throw Error(
        "Storage removal failed; rejected metadata retained for retry",
      );
  }
  console.log("Cleanup completed; rejected metadata retained.");
}
