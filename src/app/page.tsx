import Link from "next/link";
import { ArrowUpLeft, CalendarDays, ArrowLeft, BookOpen } from "lucide-react";
import { publicRecords } from "@/lib/data";
import { inWeek, persianDate } from "@/lib/time";
import { GroupRibbon } from "@/components/group-ribbon";
import { ResearchFinder } from "@/components/research-finder";
export default async function Home() {
  const [events, content] = await Promise.all([
    publicRecords("events"),
    publicRecords("content"),
  ]);
  const week = events.filter(
    (e) =>
      e.status === "published" &&
      e.starts_at &&
      inWeek(e.starts_at, new Date()),
  );
  const archive = content
    .filter(
      (e) => e.kind === "event_archive" && e.editorial?.year === "1404-1405",
    )
    .sort((a, b) => (a.editorial?.order || 0) - (b.editorial?.order || 0));
  const featured = [archive[4], archive[8], archive[3]].filter(Boolean);
  const journals = content.filter((e) => e.kind === "journals");
  return (
    <>
      <section className="research-entry">
        <img
          className="entry-wings"
          src="/assets/ut-wings.png"
          width="900"
          height="580"
          alt=""
          aria-hidden="true"
        />
        <div className="container entry-content">
          <h1>
            خانهٔ پژوهش
            <br />
            در دانشکدگان فارابی.
          </h1>
          <p>
            رویدادهای علمی، نشریات و منابع پژوهش دانشگاه تهران؛
            <br />
            مسیر موردنیازتان را پیدا کنید.
          </p>
          <ResearchFinder records={content} />
        </div>
        <div className="entry-bottom container">
          <span dir="ltr">University of Tehran Research Hub</span>
          <Link href="/club">
            آشنایی با باشگاه پژوهشیاران <ArrowUpLeft size={20} />
          </Link>
        </div>
      </section>
      <div className="container">
        <nav className="explore-nav" aria-label="خدمات پژوهشی">
          <Link href="/events">
            رویدادها <ArrowUpLeft />
          </Link>
          <Link href="/journals">
            نشریات علمی <ArrowUpLeft />
          </Link>
          <Link href="/resources">
            کتابخانه و منابع <ArrowUpLeft />
          </Link>
          <Link href="/opportunities">
            فرصت‌های پژوهشی <ArrowUpLeft />
          </Link>
        </nav>
        <section className="current-week">
          <div className="current-week-label">
            <CalendarDays size={25} />
            <h2>این هفته در UTR</h2>
          </div>
          <div>
            {week.length ? (
              week.map((e) => (
                <Link key={e.id} href={`/events/${e.id}`}>
                  {e.title}{" "}
                  <small>{e.starts_at && persianDate(e.starts_at)}</small>
                </Link>
              ))
            ) : (
              <p>هنوز رویدادی برای این هفته منتشر نشده است.</p>
            )}
          </div>
          <Link className="text-action" href="/events#current-calendar">
            تقویم رویدادها <ArrowLeft size={18} />
          </Link>
        </section>
        <section className="discovery-section">
          <div className="discovery-intro">
            <h2>
              در جریان
              <br />
              پژوهش فارابی
            </h2>
            <p>
              کارگاه‌ها و نشست‌های برگزارشده را با پوستر، موضوع و اطلاعات
              ارائه‌دهنده مرور کنید.
            </p>
            <Link className="button secondary" href="/events">
              آرشیو رویدادها <ArrowUpLeft size={20} />
            </Link>
            <p className="archive-period">
              سال تحصیلی <bdi>۱۴۰۴–۱۴۰۵</bdi>
            </p>
          </div>
          <div className="discovery-events">
            {featured.map((e, i) => (
              <Link
                className={
                  i === 0 ? "discovery-event featured" : "discovery-event"
                }
                href={`/events/archive/${e.id}`}
                key={e.id}
              >
                <div className="discovery-image">
                  <img
                    src={e.editorial?.image}
                    alt={`پوستر ${e.title}`}
                    width="1000"
                    height="1415"
                    loading="lazy"
                  />
                </div>
                <div className="discovery-caption">
                  <span>{e.editorial?.date}</span>
                  <h3>{e.title}</h3>
                  <p>{e.editorial?.speaker}</p>
                  <span className="read-event">
                    جزئیات نشست <ArrowUpLeft size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section className="club-feature">
        <div className="container club-feature-inner">
          <div className="club-feature-copy">
            <h2>باشگاه پژوهشیاران</h2>
            <p className="club-feature-slogan">
              یک نشست، یک خلاصه،
              <br />
              یک قدم جلوتر.
            </p>
            <p>
              در یک رویداد تأییدشده شرکت کنید؛ برداشت خود را بنویسید و از استاد
              درس مرتبط بازخورد بگیرید.
            </p>
            <Link className="button" href="/club">
              مسیر عضویت و مشارکت <ArrowUpLeft size={20} />
            </Link>
          </div>
          <ol className="club-feature-steps">
            <li>
              <span>۱</span>
              <div>
                <h3>حضور در رویداد</h3>
                <p>یک نشست مرتبط با درس‌های نیمسال جاری</p>
              </div>
            </li>
            <li>
              <span>۲</span>
              <div>
                <h3>یک صفحه دست‌نویس</h3>
                <p>ارسال تصویر خوانا روی فرم رسمی باشگاه</p>
              </div>
            </li>
            <li>
              <span>۳</span>
              <div>
                <h3>ارزیابی توسط استاد</h3>
                <p>صفر تا یک امتیاز برای هر رویداد؛ بدون تضمین امتیاز کامل</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
      <section className="container publication-section">
        <div className="section-heading">
          <div>
            <h2>نشریات علمی فارابی</h2>
            <p>حوزهٔ پژوهشتان را پیدا کنید و مستقیم به سامانهٔ نشریه بروید.</p>
          </div>
          <Link className="text-action" href="/journals">
            فهرست نشریات <ArrowUpLeft size={20} />
          </Link>
        </div>
        <div className="publication-strip">
          {journals.slice(0, 5).map((j) => (
            <Link href="/journals" key={j.id}>
              <img
                src={j.editorial?.image}
                width="240"
                height="340"
                loading="lazy"
                alt={`جلد ${j.title}`}
              />
              <h3 dir="auto">{j.title}</h3>
              <span>{j.editorial?.topic}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container library-feature">
        <div>
          <BookOpen size={35} strokeWidth={1.5} />
          <h2>
            منابع درست،
            <br />
            برای پرسش‌های شما.
          </h2>
          <p>
            کتاب‌ها، پایان‌نامه‌ها، پایگاه‌های اطلاعاتی و راهنمای دسترسی به
            منابع علمی.
          </p>
          <Link className="text-action" href="/resources">
            ورود به کتابخانه و منابع <ArrowUpLeft size={20} />
          </Link>
        </div>
        <img
          src="/assets/official/page-4230-1.webp"
          width="470"
          height="263"
          alt="کتابخانه مرکزی دانشکدگان فارابی"
          loading="lazy"
        />
      </section>
      <section className="container updates-section">
        {[
          ["opportunities", "فرصت‌های پژوهشی", "فراخوان جدیدی منتشر نشده است."],
          ["news", "خبرها و دستاوردها", "خبر تازه‌ای منتشر نشده است."],
        ].map(([kind, title, empty]) => (
          <div key={kind}>
            <h2>{title}</h2>
            {content.filter((e) => e.kind === kind).length ? (
              content
                .filter((e) => e.kind === kind)
                .slice(0, 3)
                .map((e) => (
                  <p key={e.id}>
                    <Link href={`/${kind}/${e.id}`}>{e.title}</Link>
                  </p>
                ))
            ) : (
              <p>{empty}</p>
            )}
            <Link className="text-action" href={`/${kind}`}>
              مشاهده {title} <ArrowUpLeft size={18} />
            </Link>
          </div>
        ))}
      </section>
      <GroupRibbon />
      <section className="container section faq-section">
        <div>
          <h2>پیش از شروع</h2>
          <p>پاسخ پرسش‌های رایج باشگاه پژوهشیاران</p>
          <Link href="/policy">قوانین کامل مشارکت</Link>
        </div>
        <div>
          {[
            [
              "چه کسانی می‌توانند عضو باشگاه شوند؟",
              "دانشجویان کارشناسی، کارشناسی ارشد و دکتری، پس از تکمیل پروفایل و تأیید وضعیت دانشجویی.",
            ],
            [
              "آیا هر نشست یک امتیاز کامل دارد؟",
              "خیر. استاد برای هر رویداد از صفر تا یک امتیاز تعیین می‌کند. امتیاز کامل تضمین نمی‌شود و هر امتیاز مثبت، حتی کسری، ارجاع دوباره را می‌بندد.",
            ],
            [
              "نسخه کاغذی خلاصه را کجا تحویل بدهم؟",
              "تحویل فیزیکی لازم نیست. تصویر یا اسکن خوانای خلاصه یک‌صفحه‌ای روی فرم رسمی را در سامانه بارگذاری می‌کنید.",
            ],
            [
              "امتیاز باشگاه همان نمره رسمی درس است؟",
              "خیر. امتیاز باشگاه با ثبت نمره در سامانه دانشگاه متفاوت است. اعمال امتیازهای تجمیعی تابع مقررات آموزشی مؤسسه است.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
