"use client";
import { useState } from "react";
import Link from "next/link";
import { persianDate } from "@/lib/time";
type Receipt = { submission: string; attachment: string };
export function UploadFlow({
  events,
  enrollments,
  relevance,
  resume,
  initialEvent,
}: {
  events: any[];
  enrollments: any[];
  relevance: any[];
  resume?: any;
  initialEvent?: string;
}) {
  const [event, setEvent] = useState(
    resume?.event_id ||
      (events.some((e) => e.id === initialEvent) ? initialEvent : "") ||
      "",
  );
  const [step, setStep] = useState(resume ? 2 : 1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [offering, setOffering] = useState(
    resume?.state === "revision_requested"
      ? resume?.referrals?.find((r: any) => r.active)?.offering_id || ""
      : "",
  );
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Receipt | null>(
    resume?.state !== "revision_requested" && resume?.attachments?.length
      ? {
          submission: resume.id,
          attachment: resume.attachments
            .filter((a: any) => a.safety === "clean")
            .sort((a: any, b: any) => b.version - a.version)[0]?.id,
        }
      : null,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [uploadId, setUploadId] = useState(() => crypto.randomUUID());
  const current = events.find((e) => e.id === event);
  const options = enrollments.filter((e) =>
    relevance.some(
      (r) => r.event_id === event && r.offering_id === e.offering_id,
    ),
  );
  async function action(action: string, data: Record<string, string>) {
    const res = await fetch("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data }),
    });
    const value = await res.json();
    if (!res.ok) throw Error(value.message);
    return value;
  }
  async function upload() {
    if (!file && !saved?.attachment) {
      setMessage("فایل را انتخاب کنید.");
      return;
    }
    if (!file && saved?.attachment) {
      setStep(3);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const id = resume?.id || (await action("begin", { event_id: event })).id;
      const body = new FormData();
      body.set("file", file!);
      body.set("submission_id", id);
      body.set("attachment_id", uploadId);
      const response: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            xhr.status < 300 ? resolve(data) : reject(Error(data.message));
          } catch {
            reject(Error("بارگذاری کامل نشد. دوباره تلاش کنید."));
          }
        };
        xhr.onerror = () =>
          reject(Error("ارتباط قطع شد. فایل انتخاب‌شده حفظ شده است."));
        xhr.send(body);
      });
      setSaved({ submission: id, attachment: response.id });
      setStep(3);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "بارگذاری انجام نشد.");
    } finally {
      setBusy(false);
    }
  }
  if (!events.length)
    return (
      <div className="empty">
        <h2>رویداد واجد شرایطی برای ارسال ندارید</h2>
        <p>
          ابتدا باید حضور شما در یک رویداد تأییدشده باشگاه ثبت شود. اگر حضور
          داشته‌اید، از پشتیبانی درخواست بررسی کنید.
        </p>
        <Link href="/workspace/events">رویدادها و وضعیت حضور</Link>
        <p>
          <Link href="/workspace/support">درخواست بررسی حضور</Link>
        </p>
      </div>
    );
  if (receipt)
    return (
      <div className="panel" role="status">
        <h2>خلاصه شما ثبت شد</h2>
        <p>شناسه پیگیری پایدار:</p>
        <p>
          <bdi>{receipt}</bdi>
        </p>
        <p>نتیجه بررسی در پرونده و اعلان‌های شما نمایش داده می‌شود.</p>
        <Link className="button" href="/workspace/submissions">
          مشاهده پرونده‌ها
        </Link>
      </div>
    );
  return (
    <>
      <ol className="steps" aria-label="مراحل ارسال">
        <li aria-current={step === 1 ? "step" : undefined}>
          رویداد و فرم رسمی
        </li>
        <li aria-current={step === 2 ? "step" : undefined}>
          بارگذاری و بررسی خوانایی
        </li>
        <li aria-current={step === 3 ? "step" : undefined}>
          انتخاب درس و تأیید نهایی
        </li>
      </ol>
      <div className="form">
        {step === 1 && (
          <>
            <label>
              رویداد با حضور تأییدشده
              <select
                value={event}
                onChange={(e) => {
                  setEvent(e.target.value);
                  setConfirmed(false);
                  setUploadId(crypto.randomUUID());
                  setFile(null);
                  if (preview) URL.revokeObjectURL(preview);
                  setPreview("");
                  setSaved(null);
                  setOffering("");
                }}
                required
              >
                <option value="">رویداد را انتخاب کنید</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            {current && (
              <div className="notice">
                <p>مهلت اولیه: {persianDate(current.summary_deadline)}</p>
                <a
                  href={`/api/form/${current.form_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  دریافت فرم رسمی رویداد
                </a>
                <p>
                  یک صفحه دست‌نویس، خوانا و کامل. حداکثر ۴ مگابایت. برای PDF،
                  بررسی امنیتی فعال لازم است.
                </p>
              </div>
            )}
            <button disabled={!event} onClick={() => setStep(2)}>
              ادامه؛ انتخاب فایل
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h2>{current?.title}</h2>
            {saved?.attachment && (
              <div className="notice">
                <a
                  href={`/api/file/${saved.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  مشاهده نسخه قبلی
                </a>
                <p>
                  می‌توانید همین نسخه را ارجاع دهید یا نسخه تازه‌ای بارگذاری
                  کنید.
                </p>
              </div>
            )}
            <label>
              تصویر JPEG، PNG، WebP یا PDF یک‌صفحه‌ای
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 4194304) {
                    setFile(null);
                    setConfirmed(false);
                    if (preview) URL.revokeObjectURL(preview);
                    setPreview("");
                    setMessage("حجم فایل بیشتر از ۴ مگابایت است.");
                    e.target.value = "";
                    return;
                  }
                  if (preview) URL.revokeObjectURL(preview);
                  setUploadId(crypto.randomUUID());
                  setConfirmed(false);
                  setFile(f);
                  setPreview(URL.createObjectURL(f));
                  setSaved(null);
                  setMessage("");
                }}
              />
            </label>
            {preview &&
              (file?.type === "application/pdf" ? (
                <iframe
                  title="پیش‌نمایش خلاصه"
                  className="viewer"
                  src={preview}
                />
              ) : (
                <img
                  alt="پیش‌نمایش خلاصه دست‌نویس"
                  src={preview}
                  style={{ width: "100%", height: "auto" }}
                />
              ))}
            <p>تمام سطرها خوانا باشند؛ لبه‌های صفحه در تصویر دیده شوند.</p>
            <button disabled={busy} onClick={upload}>
              {busy ? "در حال بارگذاری و بررسی…" : "ذخیره فایل و ادامه"}
            </button>
            {!resume && (
              <button className="button secondary" onClick={() => setStep(1)}>
                بازگشت به رویداد
              </button>
            )}
            {busy && (
              <progress
                value={progress}
                max={100}
                aria-label="پیشرفت بارگذاری"
              />
            )}
          </>
        )}
        {step === 3 && (
          <>
            <h2>مرور پیش از ارسال</h2>
            <p>{current?.title}</p>
            {saved && (
              <a
                href={`/api/file/${saved.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                بررسی نسخه ذخیره‌شده
              </a>
            )}
            <label>
              درس و استاد مرتبط از نیمسال جاری
              <select
                value={offering}
                onChange={(e) => {
                  setOffering(e.target.value);
                  setConfirmed(false);
                }}
                required
                disabled={resume?.state === "revision_requested"}
              >
                <option value="">انتخاب کنید</option>
                {options.map((e) => (
                  <option key={e.offering_id} value={e.offering_id}>
                    {e.offerings?.title} —{" "}
                    {e.instructor_name || "استاد تأییدشده درس"}
                  </option>
                ))}
              </select>
            </label>
            {resume?.state === "revision_requested" && (
              <p>اصلاح خلاصه با همان استاد ادامه می‌یابد.</p>
            )}
            <label style={{ display: "flex", alignItems: "start" }}>
              <input
                style={{ width: 20, minHeight: 20 }}
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              خوانایی و انتخاب درس را بررسی کرده‌ام و می‌دانم امتیاز کامل تضمین
              نمی‌شود.
            </label>
            <button
              disabled={busy || !offering || !confirmed}
              onClick={async () => {
                if (!saved) return;
                setBusy(true);
                try {
                  const result = await action("refer", {
                    submission_id: saved.submission,
                    attachment_id: saved.attachment,
                    offering_id: offering,
                  });
                  setReceipt(result.id);
                } catch (e) {
                  setMessage(e instanceof Error ? e.message : "ثبت انجام نشد.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "در حال ثبت…" : "تأیید و ارسال نهایی"}
            </button>
            <button className="button secondary" onClick={() => setStep(2)}>
              بازگشت به فایل
            </button>
          </>
        )}
        <p role="status" aria-live="polite">
          {message}
        </p>
      </div>
    </>
  );
}
