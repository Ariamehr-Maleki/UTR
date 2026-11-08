import { redirect } from "next/navigation";
import { identity } from "@/lib/supabase/server";
import { liveEnabled } from "@/lib/config";
import Link from "next/link";
export default async function Engagement({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string; metric?: string }>;
}) {
  if (!liveEnabled()) redirect("/workspace");
  const { db } = await identity();
  const { semester, metric } = await searchParams;
  const { data: semesters } = await db
    .from("semesters")
    .select("*")
    .order("starts_on", { ascending: false });
  const selected =
    semesters?.find((s) => s.id === semester)?.id || semesters?.[0]?.id;
  const measure = ["attendance", "summaries", "credit"].includes(metric || "")
    ? metric!
    : "attendance";
  const metricResult = selected
    ? await db.rpc("my_club_metrics", { p_semester: selected })
    : null;
  const rankResult = selected
    ? await db.rpc("leaderboard", { p_semester: selected, p_metric: measure })
    : null;
  const metrics = metricResult?.data?.[0];
  const ranking = rankResult?.data;
  const unavailable = !!metricResult?.error || !!rankResult?.error;
  return (
    <div className="container section">
      <h1>مشارکت در باشگاه</h1>
      <div className="notice">
        حضور در رویداد به‌تنهایی نمرهٔ آموزشی ندارد. استاد خلاصهٔ ارسالی را از
        صفر تا یک ارزیابی می‌کند. مجموع زیر فقط اعتبار ثبت‌شده در باشگاه است و
        به‌معنای ثبت نمره در سامانهٔ رسمی دانشگاه نیست. نام شما تنها با رضایت
        ثبت‌شده در پروفایل در جدول نمایش داده می‌شود.
      </div>
      <form className="filters">
        <label>
          نیمسال
          <select name="semester" defaultValue={selected}>
            {semesters?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          مبنای رتبه
          <select name="metric" defaultValue={measure}>
            <option value="attendance">حضور تأییدشده</option>
            <option value="summaries">خلاصه‌های ارسال‌شده</option>
            <option value="credit">مجموع اعتبار باشگاه</option>
          </select>
        </label>
        <button>نمایش</button>
      </form>
      {unavailable && (
        <p className="notice" role="alert">
          اطلاعات مشارکت فعلاً در دسترس نیست. کمی بعد دوباره تلاش کنید.
        </p>
      )}
      {!selected && (
        <p className="empty">هنوز نیمسالی برای نمایش فعالیت ثبت نشده است.</p>
      )}
      <div className="activity-summary" aria-label="خلاصه فعالیت شما">
        <p>
          <strong>
            {Number(metrics?.attended_events || 0).toLocaleString("fa-IR")}
          </strong>
          <span>حضور تأییدشده</span>
        </p>
        <p>
          <strong>
            {Number(metrics?.submitted_summaries || 0).toLocaleString("fa-IR")}
          </strong>
          <span>خلاصهٔ ارسال‌شده</span>
        </p>
        <p>
          <strong>
            {Number(metrics?.club_credit || 0).toLocaleString("fa-IR", {
              maximumFractionDigits: 2,
            })}
          </strong>
          <span>مجموع اعتبار باشگاه</span>
        </p>
      </div>
      <h2>جدول مشارکت با رضایت اعضا</h2>
      <p>
        مبنای رتبه را خودتان انتخاب کنید. هر سه شاخص جداگانه نمایش داده می‌شوند؛
        اعضای دارای مقدار برابر در شاخص انتخاب‌شده رتبهٔ مشترک دارند.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>رتبه مشترک</th>
              <th>نام</th>
              <th>حضور</th>
              <th>خلاصه</th>
              <th>اعتبار باشگاه</th>
            </tr>
          </thead>
          <tbody>
            {ranking?.map((r: any, i: number) => (
              <tr key={i}>
                <td>{r.rank_position}</td>
                <td>{r.display_name}</td>
                <td>{Number(r.attended_events).toLocaleString("fa-IR")}</td>
                <td>{Number(r.submitted_summaries).toLocaleString("fa-IR")}</td>
                <td>
                  {Number(r.club_credit).toLocaleString("fa-IR", {
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!ranking?.length && (
        <p className="empty">
          هنوز عضوی نمایش عمومی رتبه را انتخاب نکرده است. برای نمایش نام خود،
          رضایت را در پروفایل ثبت کنید.
        </p>
      )}
      <h2>گواهی‌ها</h2>
      <p>
        گواهی با تصمیم معاونت پژوهشی صادر می‌شود. گواهی‌های صادرشده را در{" "}
        <Link href="/workspace/certificates">صفحهٔ گواهی‌های من</Link> ببینید یا
        از بخش پشتیبانی درخواست بررسی ثبت کنید.
      </p>
    </div>
  );
}
