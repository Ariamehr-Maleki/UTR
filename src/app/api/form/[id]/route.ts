import { identity } from "@/lib/supabase/server";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { db } = await identity();
    const { id } = await params;
    const { data: form } = await db
      .from("forms")
      .select("*")
      .eq("id", id)
      .eq("approved", true)
      .single();
    if (!form) return new Response("Not found", { status: 404 });
    const { data, error } = await db.storage
      .from("forms")
      .download(form.object_path);
    if (error) return new Response("Not found", { status: 404 });
    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="utr-official-form.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
