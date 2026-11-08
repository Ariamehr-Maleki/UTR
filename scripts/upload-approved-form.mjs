// One-time operator task for the authored, explicitly approved UTR-RFC-01 asset.
// Reads a server credential from stdin; never writes or prints it.
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
let credential = "";
for await (const chunk of process.stdin) credential += chunk;
const db = createClient(
  "https://spqtwgyxzdythfmyzvyh.supabase.co",
  credential.trim(),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
credential = "";
const bytes = await fs.readFile("docs/forms/UTR-RFC-01.pdf");
if ((await PDFDocument.load(bytes)).getPageCount() !== 1)
  throw Error("Expected a one-page approved form");
const path = "official/UTR-RFC-01.pdf";
const existing = await db.storage.from("forms").download(path);
if (existing.data) {
  if (!Buffer.from(await existing.data.arrayBuffer()).equals(bytes))
    throw Error("Existing immutable form differs; create a new version");
} else {
  const uploaded = await db.storage
    .from("forms")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (uploaded.error) throw Error("Private approved-form upload failed");
}
const check = await db.storage.from("forms").download(path);
if (check.error || !Buffer.from(await check.data.arrayBuffer()).equals(bytes))
  throw Error("Private form readback failed");
const publicResponse = await fetch(
  "https://spqtwgyxzdythfmyzvyh.supabase.co/storage/v1/object/public/forms/" +
    path,
);
if (publicResponse.ok) throw Error("Form bucket unexpectedly public");
console.log(
  JSON.stringify({
    path,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    privateReadback: true,
    publicAccess: false,
  }),
);
