"use client";
import { useState } from "react";
type Item = {
  [key: string]: any;
  id: string;
  title?: string;
  name?: string;
  display_name?: string;
};
const labels: Record<string, string> = {
  id: "شناسه رکورد موجود؛ برای ایجاد جدید خالی بگذارید",
  title: "عنوان",
  name: "نام",
  description: "شرح",
  department_id: "گروه آموزشی",
  user_id: "کاربر",
  instructor_id: "استاد",
  semester_id: "نیمسال",
  event_id: "رویداد",
  offering_id: "درس",
  form_id: "فرم رسمی",
  policy_id: "سیاست مصوب",
  starts_at: "شروع رویداد به وقت تهران",
  ends_at: "پایان رویداد به وقت تهران",
  starts_on: "آغاز نیمسال",
  ends_on: "پایان نیمسال",
  venue: "محل برگزاری",
  speaker: "سخنران",
  organizer: "برگزارکننده",
  registration_opens: "آغاز ثبت‌نام به وقت تهران",
  registration_closes: "پایان ثبت‌نام به وقت تهران",
  capacity: "ظرفیت",
  club_approved: "تأیید باشگاه",
  summary_deadline: "مهلت خلاصه به وقت تهران",
  status: "وضعیت",
  membership: "وضعیت عضویت",
  approved: "تأیید",
  confirmed: "حضور تأیید شده",
  kind: "نوع محتوا",
  year: "سال تحصیلی",
  date: "تاریخ نمایشی",
  time: "ساعت نمایشی",
  topic: "حوزه موضوعی",
  image: "نشانی تصویر رسمی",
  source: "پیوند منبع رسمی",
  email: "ایمیل دفتر",
  phone: "تلفن دفتر",
  order: "ترتیب نمایش",
  external_url: "نشانی رسمی HTTPS",
  resolution: "پاسخ به درخواست",
  state: "وضعیت پرونده",
  version: "شماره نسخه",
  object_path: "شناسه فایل رسمی",
  role: "نقش",
  revision_hours: "مهلت اصلاح؛ ساعت",
  referral_hours: "مهلت ارجاع بعدی؛ ساعت",
  max_alternatives: "تعداد ارجاع جایگزین",
  unlimited_alternatives: "ارجاع بدون سقف مصوب",
  review_hours: "زمان پاسخ مورد انتظار؛ ساعت",
  activity: "فعالیت واجد شرایط",
  points: "امتیاز مشارکت مصوب",
  minimum_points: "حداقل امتیاز نشان",
  points_enabled: "فعال‌سازی مشارکت با قواعد مصوب",
  certificates_enabled: "فعال‌سازی گواهی با شرایط مصوب",
  online_url: "نشانی حضور آنلاین HTTPS",
};
const operations: Record<string, [string, string[]]> = {
  membership: ["بررسی عضویت", ["user_id", "membership"]],
  instructor: ["تأیید استاد", ["user_id", "department_id", "approved"]],
  attendance: ["ثبت و اصلاح حضور", ["event_id", "user_id", "confirmed"]],
  event: [
    "رویداد",
    [
      "id",
      "title",
      "description",
      "department_id",
      "starts_at",
      "ends_at",
      "venue",
      "online_url",
      "speaker",
      "organizer",
      "registration_opens",
      "registration_closes",
      "capacity",
      "club_approved",
      "summary_deadline",
      "form_id",
      "policy_id",
      "status",
    ],
  ],
  offering: [
    "درس و استاد",
    [
      "id",
      "title",
      "department_id",
      "semester_id",
      "instructor_id",
      "approved",
    ],
  ],
  semester: ["نیمسال", ["title", "starts_on", "ends_on"]],
  enrollment: ["انتخاب درس دانشجو", ["user_id", "offering_id", "approved"]],
  relevance: ["ارتباط رویداد و درس", ["event_id", "offering_id"]],
  content: [
    "محتوا و منابع",
    [
      "id",
      "kind",
      "title",
      "description",
      "external_url",
      "year",
      "date",
      "time",
      "speaker",
      "venue",
      "topic",
      "image",
      "source",
      "email",
      "phone",
      "order",
      "department_id",
      "status",
    ],
  ],
  appeal: ["رسیدگی به درخواست", ["id", "status", "resolution"]],
  correction: ["اصلاح استثنایی پرونده", ["id", "state"]],
  form: ["نسخه فرم رسمی", ["version", "title", "object_path", "approved"]],
  role: [
    "نقش و دامنه دسترسی",
    ["user_id", "role", "department_id", "approved"],
  ],
  department: ["گروه آموزشی", ["name"]],
  policy: [
    "نسخه سیاست مصوب",
    [
      "name",
      "approved",
      "revision_hours",
      "referral_hours",
      "max_alternatives",
      "unlimited_alternatives",
      "review_hours",
      "points_enabled",
      "certificates_enabled",
    ],
  ],
  points_rule: ["قاعده مشارکت", ["activity", "points", "approved"]],
  badge: ["نشان مشارکت", ["title", "minimum_points", "approved"]],
};
const selects: Record<string, string[][]> = {
  membership: [
    ["pending", "در انتظار بررسی"],
    ["approved", "تأییدشده"],
    ["suspended", "تعلیق"],
    ["inactive", "غیرفعال"],
  ],
  role: [
    ["student", "دانشجو"],
    ["instructor", "استاد"],
    ["admin", "اداره پژوهشی"],
    ["superadmin", "مدیرکل فنی"],
  ],
  kind: [
    ["opportunities", "فرصت پژوهشی"],
    ["journals", "نشریه"],
    ["event_archive", "رویداد آرشیوی"],
    ["resources", "منبع علمی"],
    ["news", "خبر و دستاورد"],
    ["about", "درباره و تماس"],
    ["privacy", "حریم خصوصی"],
    ["policy", "قوانین"],
    ["faq", "پرسش متداول"],
  ],
  state: [
    ["administrative_review", "بررسی اداری"],
    ["suspended", "تعلیق"],
    ["invalidated", "ابطال"],
    ["completed", "تکمیل پرونده"],
  ],
  activity: [
    ["attendance", "حضور تأییدشده"],
    ["summary_assessed", "خلاصه ارزیابی‌شده"],
  ],
};
const refs: Record<string, string> = {
  department_id: "departments",
  user_id: "profiles",
  instructor_id: "profiles",
  semester_id: "semesters",
  event_id: "events",
  offering_id: "offerings",
  form_id: "forms",
  policy_id: "policies",
};
export function AdminConsole({
  superadmin,
  academic,
  catalog = {},
  initialOperation,
}: {
  superadmin: boolean;
  academic: boolean;
  catalog?: Record<string, Item[]>;
  initialOperation?: string;
}) {
  const allowed = Object.keys(operations).filter((k) =>
    ["role", "department"].includes(k) ? superadmin : academic,
  );
  const [op, setOp] = useState(
    initialOperation && allowed.includes(initialOperation)
      ? initialOperation
      : allowed[0],
  );
  const [selected, setSelected] = useState("");
  const [mutationId, setMutationId] = useState(() => crypto.randomUUID());
  const table = (
    {
      event: "events",
      offering: "offerings",
      content: "content",
      appeal: "appeals",
      correction: "submissions",
      membership: "profiles",
      instructor: "profiles",
    } as Record<string, string>
  )[op];
  const records = catalog[table] || [];
  const record = records.find((r) => r.id === selected);
  function value(key: string) {
    if (key === "user_id" && ["membership", "instructor"].includes(op))
      return record?.id || "";
    const raw = record?.[key] ?? record?.editorial?.[key];
    if (raw == null) return "";
    if (
      [
        "starts_at",
        "ends_at",
        "registration_opens",
        "registration_closes",
        "summary_deadline",
      ].includes(key)
    )
      return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      })
        .format(new Date(raw))
        .replace(" ", "T");
    return String(raw);
  }
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="notice">
        هر تغییر حساس با دلیل مکتوب ثبت می‌شود. سیاست‌های جدید، مهلت پرونده‌های
        قبلی را تغییر نمی‌دهند. مقدار خالی در تنظیمات مهلت به معنای سیاست
        تعیین‌نشده است.
      </div>
      {academic && (
        <p>
          <a href="/api/reports">دریافت گزارش مجاز CSV</a>
        </p>
      )}
      <div className="panel">
        <label>
          بخش مدیریت
          <select
            value={op}
            onChange={(e) => {
              setOp(e.target.value);
              setMutationId(crypto.randomUUID());
              setSelected("");
              setMessage("");
            }}
          >
            {allowed.map((k) => (
              <option key={k} value={k}>
                {operations[k][0]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {table && (
        <label>
          انتخاب رکورد موجود برای بررسی یا ویرایش
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setMutationId(crypto.randomUUID());
            }}
          >
            <option value="">رکورد جدید / انتخاب کنید</option>
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title || r.subject || r.display_name || r.id} —{" "}
                {r.status || r.state || r.membership || ""}
              </option>
            ))}
          </select>
        </label>
      )}
      {record?.body && (
        <div className="notice">
          <p>{record.body}</p>
        </div>
      )}
      {record && table === "profiles" && (
        <section className="profile-review">
          <h2>مشخصات برای بررسی عضویت</h2>
          <dl>
            <dt>نام</dt>
            <dd>{record.display_name || "تکمیل نشده"}</dd>
            <dt>شماره دانشجویی</dt>
            <dd>
              <bdi>{record.student_number || "ثبت نشده"}</bdi>
            </dd>
            <dt>مقطع</dt>
            <dd>
              {(
                {
                  bachelor: "کارشناسی",
                  master: "کارشناسی ارشد",
                  doctorate: "دکتری",
                } as Record<string, string>
              )[record.degree] || "ثبت نشده"}
            </dd>
            <dt>گروه آموزشی</dt>
            <dd>
              {catalog.departments?.find((d) => d.id === record.department_id)
                ?.name || "ثبت نشده"}
            </dd>
          </dl>
          <p>
            تأیید عضویت را پس از تطبیق این مشخصات با مدارک یا مرجع دانشگاهی ثبت
            کنید.
          </p>
        </section>
      )}
      <form
        key={`${op}:${selected}`}
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const all = Object.fromEntries(
            new FormData(e.currentTarget),
          ) as Record<string, string>;
          const reason = all.reason;
          delete all.reason;
          const data = Object.fromEntries(
            Object.entries(all).filter(([, v]) => v !== ""),
          );
          if (
            !data.id &&
            ["event", "content", "offering", "department"].includes(op)
          )
            data.id = mutationId;
          for (const k of [
            "starts_at",
            "ends_at",
            "registration_opens",
            "registration_closes",
            "summary_deadline",
          ])
            if (data[k]) data[k] += "+03:30";
          try {
            const res = await fetch("/api/action", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "admin",
                data: { operation: op, payload: JSON.stringify(data), reason },
              }),
            });
            const result = await res.json();
            setMessage(
              result.message + (result.id ? ` شناسه پیگیری: ${result.id}` : ""),
            );
          } catch {
            setMessage("ارتباط برقرار نشد. اطلاعات فرم حفظ شده است.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {operations[op]?.[1].map((key) => {
          let options = selects[key];
          if (
            [
              "approved",
              "confirmed",
              "club_approved",
              "unlimited_alternatives",
              "points_enabled",
              "certificates_enabled",
            ].includes(key)
          )
            options = [
              ["false", "خیر"],
              ["true", "بله"],
            ];
          if (key === "status")
            options =
              op === "appeal"
                ? [
                    ["open", "باز"],
                    ["reviewing", "در حال بررسی"],
                    ["resolved", "پاسخ داده‌شده"],
                  ]
                : [
                    ["draft", "پیش‌نویس"],
                    ["published", "منتشرشده"],
                    ...(op === "event" ? [["cancelled", "لغوشده"]] : []),
                  ];
          if (refs[key])
            options = (catalog[refs[key]] || []).map((i) => [
              i.id,
              i.title || i.name || i.display_name || i.id,
            ]);
          const optional = [
            "id",
            "capacity",
            "speaker",
            "organizer",
            "venue",
            "online_url",
            "external_url",
            "summary_deadline",
            "form_id",
            "policy_id",
            "revision_hours",
            "referral_hours",
            "max_alternatives",
            "review_hours",
            "department_id",
            "year",
            "date",
            "time",
            "topic",
            "image",
            "source",
            "email",
            "phone",
            "order",
          ].includes(key);
          return (
            <label key={key}>
              {labels[key]}
              {options ? (
                <select
                  name={key}
                  required={!optional}
                  defaultValue={value(key)}
                >
                  <option value="">انتخاب کنید</option>
                  {options.map(([v, t]) => (
                    <option key={v} value={v}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : ["description", "resolution"].includes(key) ? (
                <textarea name={key} required defaultValue={value(key)} />
              ) : (
                <input
                  name={key}
                  defaultValue={value(key)}
                  required={
                    !optional ||
                    (["appeal", "correction"].includes(op) && key === "id")
                  }
                  type={
                    key.endsWith("_at") ||
                    [
                      "registration_opens",
                      "registration_closes",
                      "summary_deadline",
                    ].includes(key)
                      ? "datetime-local"
                      : key.endsWith("_on")
                        ? "date"
                        : [
                              "capacity",
                              "revision_hours",
                              "referral_hours",
                              "max_alternatives",
                              "review_hours",
                              "points",
                              "minimum_points",
                            ].includes(key)
                          ? "number"
                          : key === "external_url"
                            ? "url"
                            : "text"
                  }
                  min="0"
                  step={
                    key.endsWith("_at") ||
                    [
                      "registration_opens",
                      "registration_closes",
                      "summary_deadline",
                    ].includes(key)
                      ? "1"
                      : undefined
                  }
                />
              )}
            </label>
          );
        })}
        <label>
          دلیل تغییر
          <textarea name="reason" minLength={5} maxLength={2000} required />
        </label>
        <button disabled={busy}>{busy ? "در حال ثبت…" : "ثبت تغییر"}</button>
        <p role="status">{message}</p>
      </form>
    </>
  );
}
