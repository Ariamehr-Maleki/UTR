import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { persianDate } from "@/lib/time";
import { statusLabel } from "@/lib/status";

const outcomeName: Record<string, string> = {
  score: "ارزیابی استاد",
  revision: "درخواست اصلاح",
  wrong_course: "بازگشت به دلیل نامرتبط بودن درس",
  administrative_review: "ارجاع به بررسی اداری",
};

export async function ReportDetail({
  db,
  id,
}: {
  db: SupabaseClient;
  id: string | undefined;
}) {
  if (!id || !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id))
    return <p className="notice error">شناسهٔ گزارش معتبر نیست.</p>;
  const { data: report, error } = await db
    .from("submissions")
    .select(
      "id,state,student_id,created_at,deadline_snapshot,positive_locked,events(title,starts_at),attachments(id,version,created_at),referrals(id,created_at,active,attachment_id,offerings(title,instructor_id),assessments(id,outcome,score,feedback,created_at,attachment_id))",
    )
    .eq("id", id)
    .single();
  if (error || !report)
    return (
      <p className="notice error" role="alert">
        گزارش در دسترس نیست یا مجوز مشاهدهٔ آن را ندارید.
      </p>
    );
  const event = Array.isArray(report.events) ? report.events[0] : report.events;
  const attachments = [...(report.attachments || [])].sort(
    (a: any, b: any) => a.version - b.version,
  );
  const referrals = [...(report.referrals || [])].sort(
    (a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return (
    <div className="report-detail">
      <Link href="/workspace">بازگشت به فضای کار</Link>
      <header>
        <h2>{event?.title || "گزارش پژوهشی"}</h2>
        <span className="badge">
          {statusLabel[report.state] || report.state}
        </span>
      </header>
      <p>
        ثبت اولیه: {persianDate(report.created_at)} · مهلت اولیه:{" "}
        {persianDate(report.deadline_snapshot)}
      </p>
      {report.positive_locked && (
        <p className="notice">
          امتیاز مثبت برای این رویداد ثبت شده و ارجاع به استاد دیگر بسته است.
        </p>
      )}
      <h3>نسخه‌های خلاصه</h3>
      {attachments.length ? (
        <ol className="record-list">
          {attachments.map((file: any) => (
            <li key={file.id}>
              نسخهٔ {Number(file.version).toLocaleString("fa-IR")} ·{" "}
              {persianDate(file.created_at)}{" "}
              <a
                href={`/api/file/${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                مشاهدهٔ فایل خصوصی
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p>هنوز فایلی برای این گزارش ثبت نشده است.</p>
      )}
      <h3>مسیر ارجاع و بازخورد</h3>
      {referrals.length ? (
        <ol className="report-timeline">
          {referrals.map((referral: any) => {
            const course = Array.isArray(referral.offerings)
              ? referral.offerings[0]
              : referral.offerings;
            const file = attachments.find(
              (a: any) => a.id === referral.attachment_id,
            );
            return (
              <li key={referral.id}>
                <h4>{course?.title || "درس مرتبط"}</h4>
                <p>
                  ارجاع در {persianDate(referral.created_at)} · نسخهٔ{" "}
                  {file?.version ?? "—"}
                </p>
                {referral.assessments?.length ? (
                  referral.assessments.map((assessment: any) => (
                    <div key={assessment.id} className="report-decision">
                      <strong>
                        {outcomeName[assessment.outcome] || "تصمیم ثبت‌شده"}
                      </strong>
                      {assessment.score !== null && (
                        <span>
                          امتیاز{" "}
                          {Number(assessment.score).toLocaleString("fa-IR")} از
                          ۱
                        </span>
                      )}
                      <p>{assessment.feedback}</p>
                      <small>{persianDate(assessment.created_at)}</small>
                    </div>
                  ))
                ) : (
                  <p>در انتظار تصمیم استاد</p>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p>
          پس از ارسال خلاصه، ارجاع‌ها و تصمیم‌ها در اینجا نمایش داده می‌شوند.
        </p>
      )}
      <p>
        <Link href={`/workspace/support?submission=${report.id}`}>
          ثبت درخواست بررسی اداری دربارهٔ این گزارش
        </Link>
      </p>
    </div>
  );
}
