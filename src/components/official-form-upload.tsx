"use client";
import { useState } from "react";
export function OfficialFormUpload() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <details>
      <summary>بارگذاری نسخه رسمی فرم باشگاه</summary>
      <p>
        فایل مصوب مؤسسه را بارگذاری کنید. این بخش برای اداره پژوهشی با اختیار
        سراسری است.
      </p>
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          setBusy(true);
          try {
            const response = await fetch("/api/admin/form-upload", {
              method: "POST",
              body: data,
            });
            const result = await response.json();
            setMessage(result.message);
          } catch {
            setMessage("ارتباط قطع شد؛ فایل انتخاب‌شده حفظ شده است.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          عنوان فرم
          <input name="title" required maxLength={200} />
        </label>
        <label>
          شناسه نسخه یکتا
          <input name="version" required maxLength={100} />
        </label>
        <label>
          فایل PDF یک‌صفحه‌ای
          <input name="file" type="file" accept="application/pdf" required />
        </label>
        <label>
          دلیل و مرجع تصویب
          <textarea name="reason" required minLength={5} />
        </label>
        <button disabled={busy}>
          {busy ? "در حال بررسی و ثبت…" : "بارگذاری و ثبت فرم مصوب"}
        </button>
        <p role="status">{message}</p>
      </form>
    </details>
  );
}
