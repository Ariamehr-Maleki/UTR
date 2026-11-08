import Link from "next/link";
import { notFound } from "next/navigation";
export default async function Preview({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!["student", "instructor"].includes(role)) notFound();
  return (
    <div className="container workspace">
      <aside className="sidebar">
        <h2>فضای کار پژوهشی</h2>
        <Link href="/preview/student">نمای دانشجو</Link>
        <Link href="/preview/instructor">نمای استاد</Link>
        <Link href="/club">قوانین باشگاه</Link>
      </aside>
      <section>
        <div className="notice">
          پیش‌نمایش رابط — هیچ حساب، پرونده یا امتیاز واقعی در این نما وجود
          ندارد.
        </div>
        <h1>
          {role === "instructor" ? "میز ارزیابی استاد" : "مسیر پژوهشی شما"}
        </h1>
        <div className="panel">
          <h2>
            {role === "instructor"
              ? "خلاصه‌های در انتظار بررسی"
              : "آماده برای نخستین قدم"}
          </h2>
          <p>
            {role === "instructor"
              ? "خلاصه‌های ارجاع‌شده به درس‌های تأییدشده شما، با نسخه فایل و سابقه بررسی در این بخش نمایش داده می‌شوند."
              : "پس از تأیید عضویت، در یک نشست علمی شرکت کنید و خلاصه خود را برای استاد مرتبط بفرستید."}
          </p>
          <Link className="button" href="/events">
            مشاهده رویدادها
          </Link>
        </div>
        <div className="split">
          <section>
            <h2>
              {role === "instructor" ? "راهنمای ارزیابی" : "خلاصه‌های من"}
            </h2>
            <div className="empty">
              {role === "instructor"
                ? "امتیاز صفر تا یک، بازخورد کتبی و تأیید نهایی پیش از ثبت امتیاز مثبت."
                : "هنوز خلاصه‌ای ثبت نشده است."}
            </div>
          </section>
          <section>
            <h2>درس‌های نیمسال</h2>
            <p className="muted">
              درس‌ها و ارتباط استاد پس از تأیید اداره پژوهشی در این بخش قرار
              می‌گیرند.
            </p>
            <Link href="/club">آشنایی با روند ارزیابی</Link>
          </section>
        </div>
      </section>
    </div>
  );
}
