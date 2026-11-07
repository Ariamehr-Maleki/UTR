import { identity } from "@/lib/supabase/server";
import { z } from "zod";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    z.uuid().parse(id);
    const { db } = await identity();
    const { data: a, error } = await db
      .from("attachments")
      .select("*")
      .eq("id", id)
      .eq("safety", "clean")
      .single();
    if (error || !a) return new Response("Not found", { status: 404 });
    const file = await db.storage.from("summaries").download(a.object_path);
    if (file.error) return new Response("Not found", { status: 404 });
    return new Response(file.data, {
      headers: {
        "Content-Type": a.mime,
        "Content-Disposition": `inline; filename="summary-${id}.${a.mime === "application/pdf" ? "pdf" : "jpg"}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy":
          "sandbox; default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self'",
      },
    });
  } catch {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
