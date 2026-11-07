import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { identity } from "@/lib/supabase/server";
import { scannerClient } from "@/lib/supabase/service";
import { safeImage, MAX_UPLOAD } from "@/lib/uploads";
import { scanPdf } from "@/lib/scanner";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (req.headers.get("origin") !== process.env.APP_ORIGIN)
    return NextResponse.json(
      { message: "درخواست نامعتبر است." },
      { status: 403 },
    );
  try {
    const { db } = await identity();
    const authority = await db.rpc("has_role", { wanted: "admin" });
    if (authority.error || authority.data !== true)
      return NextResponse.json(
        { message: "اختیار سراسری اداره پژوهشی لازم است." },
        { status: 403 },
      );
    const form = await req.formData();
    const file = form.get("file");
    const reason = String(form.get("reason") || "");
    const title = String(form.get("title") || "");
    const version = String(form.get("version") || "");
    if (
      !(file instanceof File) ||
      file.size > MAX_UPLOAD ||
      reason.trim().length < 5 ||
      !title ||
      !version
    )
      throw Error();
    const safe = await safeImage(Buffer.from(await file.arrayBuffer()));
    if (safe.mime !== "application/pdf") throw Error();
    await scanPdf(safe.bytes);
    const service = scannerClient();
    const path = `official/${randomUUID()}.pdf`;
    const uploaded = await service.storage
      .from("forms")
      .upload(path, safe.bytes, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploaded.error) throw Error();
    const saved = await db.rpc("admin_action", {
      p_action: "form",
      p_data: { title, version, object_path: path, approved: true },
      p_reason: reason,
    });
    if (saved.error) {
      await service.storage.from("forms").remove([path]);
      throw Error();
    }
    return NextResponse.json({
      message: "نسخه فرم رسمی ثبت و برای استفاده در رویداد آماده شد.",
      id: saved.data,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "ثبت انجام نشد. PDF باید یک صفحه و حداکثر ۴ مگابایت باشد؛ بررسی امنیتی و نسخه یکتا نیز لازم است.",
      },
      { status: 422 },
    );
  }
}
