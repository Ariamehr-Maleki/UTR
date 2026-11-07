import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
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
  if (Number(req.headers.get("content-length")) > MAX_UPLOAD + 20000)
    return NextResponse.json(
      { message: "حجم فایل بیش از حد مجاز است." },
      { status: 413 },
    );
  try {
    const { db, user } = await identity();
    const service = scannerClient();
    const form = await req.formData();
    const submission = z.uuid().parse(form.get("submission_id"));
    const id = z.uuid().parse(form.get("attachment_id"));
    const file = form.get("file");
    if (!(file instanceof File) || file.size > MAX_UPLOAD) throw Error();
    const original = Buffer.from(await file.arrayBuffer());
    const safe = await safeImage(original);
    if (safe.needsScanner) {
      try {
        await scanPdf(safe.bytes);
      } catch {
        return NextResponse.json(
          {
            message:
              "فایل PDF تأیید امنیتی نشد یا سرویس بررسی در دسترس نیست. تصویر JPEG یا PNG ارسال کنید.",
          },
          { status: 422 },
        );
      }
    }
    const hash = createHash("sha256").update(safe.bytes).digest("hex");
    const { error } = await db.rpc("add_attachment", {
      p_submission: submission,
      p_id: id,
      p_mime: safe.mime,
      p_bytes: safe.bytes.length,
      p_hash: hash,
    });
    if (error)
      return NextResponse.json(
        { message: "مجوز بارگذاری یا مهلت پرونده معتبر نیست." },
        { status: 409 },
      );
    const path = `${user.id}/${submission}/${id}`;
    const result = await db.storage
      .from("summaries")
      .upload(path, safe.bytes, { contentType: safe.mime, upsert: false });
    if (result.error) {
      const existing = await db.storage.from("summaries").download(path);
      if (
        existing.error ||
        createHash("sha256")
          .update(Buffer.from(await existing.data.arrayBuffer()))
          .digest("hex") !== hash
      )
        throw Error();
    }
    const originalHash = createHash("sha256").update(original).digest("hex");
    const originalRecord = await service.rpc("record_original", {
      p_id: id,
      p_hash: originalHash,
      p_mime: safe.originalMime,
      p_bytes: original.length,
    });
    if (originalRecord.error) throw Error();
    if (originalRecord.data) {
      const originalUpload = await service.storage
        .from("summaries")
        .upload(originalRecord.data, original, {
          contentType: safe.originalMime,
          upsert: false,
        });
      if (originalUpload.error) {
        const prior = await service.storage
          .from("summaries")
          .download(originalRecord.data);
        if (
          prior.error ||
          createHash("sha256")
            .update(Buffer.from(await prior.data.arrayBuffer()))
            .digest("hex") !== originalHash
        )
          throw Error();
      }
    }
    const finalized = await service.rpc("finalize_attachment", {
      p_id: id,
      p_hash: hash,
      p_clean: true,
    });
    if (finalized.error) throw Error();
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json(
      {
        message:
          "بارگذاری کامل نشد. نوع و حجم فایل را بررسی کنید؛ در صورت تداوم مشکل با پشتیبانی تماس بگیرید.",
      },
      { status: 400 },
    );
  }
}
