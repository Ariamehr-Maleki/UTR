import Link from "next/link";
import {
  ArrowUpLeft,
  CalendarDays,
  BookOpen,
  Library,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { publicRecords } from "@/lib/data";
import { inWeek, persianDate } from "@/lib/time";
import { GroupRibbon } from "@/components/group-ribbon";
export default async function Home() {
  const [events, archive, journals, news, opportunities] = await Promise.all([
    publicRecords("events"),
    publicRecords("content", "event_archive"),
    publicRecords("content", "journals"),
    publicRecords("content", "news"),
    publicRecords("content", "opportunities"),
  ]);
  const week = events.filter(
    (e) =>
      e.status === "published" &&
      e.starts_at &&
      inWeek(e.starts_at, new Date()),
  );
  const featured = archive
    .filter((e) => e.editorial?.year === "1404-1405")
    .sort((a, b) => (a.editorial?.order || 0) - (b.editorial?.order || 0));
  const spotlight = [featured[4], featured[8], featured[3]].filter(Boolean);
  return (
    <>
      <section className="research-hero">
        <div className="container research-hero-grid">
          <div className="hero-copy">
            <h1>
              پژوهش،
              <br />
              از همین‌جا
              <br />
              آغاز می‌شود.
            </h1>
            <p>
              رویدادها، فرصت‌ها و منابع علمی در یک مسیر.
              <br />
              پلتفرم پژوهش و فناوری دانشکدگان فارابی دانشگاه تهران.
            </p>
            <div className="actions">
              <Link className="button" href="/events">
                کاوش در رویدادها <ArrowUpLeft size={20} />
              </Link>
              <Link className="text-action" href="/club">
                باشگاه پژوهشیاران <ArrowLeft size={19} />
              </Link>
            </div>
            <div className="hero-signature">
              <img src="/assets/ut-emblem.png" width="36" height="36" alt="" />
              <span>
                University of Tehran Research Hub
                <br />
                <b>دانشکدگان فارابی · دانشگاه تهران</b>
              </span>
            </div>
          </div>
          <div className="research-board">
            <div className="board-heading">
              <span>از آرشیو رویدادهای فارابی</span>
              <bdi>۱۴۰۴–۱۴۰۵</bdi>
            </div>
            <div className="board-posters">
              {spotlight.map((e, i) => (
                <Link
                  key={e.id}
                  className={`board-poster board-poster-${i}`}
                  href={`/events/archive/${e.id}`}
                >
                  <img
                    src={e.editorial?.image}
                    alt={e.title}
                    width="1000"
                    height="1415"
                  />
                  <span>{e.title}</span>
                </Link>
              ))}
            </div>
            <Link className="board-footer" href="/events">
              <span>ایده‌های تازه، گفت‌وگوهای ماندگار</span>
              <ArrowUpLeft size={24} />
            </Link>
          </div>
        </div>
      </section>
      <div className="container">
        <div className="service-rail">
          {[
            [CalendarDays, "رویدادهای علمی", "کارگاه و نشست", "/events"],
            [
              GraduationCap,
              "فرصت‌های پژوهشی",
              "فراخوان و همکاری",
              "/opportunities",
            ],
            [BookOpen, "نشریات علمی", "مقاله و انتشار", "/journals"],
            [Library, "کتابخانه و منابع", "جست‌وجو و مطالعه", "/resources"],
          ].map(([Icon, title, desc, href]) => {
            const I = Icon as typeof CalendarDays;
            return (
              <Link key={href as string} href={href as string}>
                <I size={26} />
                <span>
                  <strong>{title as string}</strong>
                  <small>{desc as string}</small>
                </span>
                <ArrowUpLeft size={18} />
              </Link>
            );
          })}
        </div>
        <section className="section weekly-section">
          <div className="section-heading">
            <div>
              <h2>این هفته در UTR</h2>
              <p>نشست‌های این هفته و فرصت‌های تازه برای همراه شدن.</p>
            </div>
            <Link className="text-action" href="/events#current-calendar">
              تقویم رویدادها <ArrowUpLeft size={18} />
            </Link>
          </div>
          {week.length ? (
            <div>
              {week.map((e) => (
                <article className="resource-row" key={e.id}>
                  <Link href={`/events/${e.id}`}>{e.title}</Link>
                  <span>{e.starts_at && persianDate(e.starts_at)}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="week-empty">
              <CalendarDays size={40} strokeWidth={1.3} />
              <div>
                <h3>برنامه‌های تازه در راه‌اند</h3>
                <p>
                  رویداد جدیدی برای این هفته منتشر نشده است. تا آن زمان،
                  برنامه‌های سال‌های گذشته را مرور کنید.
                </p>
              </div>
              <Link href="/events">
                مرور آرشیو <ArrowLeft size={18} />
              </Link>
            </div>
          )}
        </section>
        <section className="section archive-feature">
          <div className="section-heading">
            <div>
              <h2>از ایده تا گفت‌وگو</h2>
              <p>
                منتخبی از برنامه‌های پژوهشی سال تحصیلی <bdi>۱۴۰۴–۱۴۰۵</bdi>
              </p>
            </div>
            <Link className="text-action" href="/events">
              همه برنامه‌ها <ArrowUpLeft size={18} />
            </Link>
          </div>
          <div className="home-event-grid">
            {spotlight.map((e) => (
              <Link
                key={e.id}
                className="home-event"
                href={`/events/archive/${e.id}`}
              >
                <div>
                  <img
                    src={e.editorial?.image}
                    alt={`پوستر ${e.title}`}
                    loading="lazy"
                    width="1000"
                    height="1415"
                  />
                </div>
                <span>{e.editorial?.date} · آرشیو</span>
                <h3>{e.title}</h3>
                <p>{e.editorial?.speaker}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="club-invitation">
          <div>
            <h2>
              یک نشست، یک خلاصه،
              <br />
              یک قدم جلوتر.
            </h2>
            <p>
              باشگاه پژوهشیاران؛ حضور در رویداد علمی، نوشتن برداشت شما و دریافت
              بازخورد استاد مرتبط.
            </p>
            <Link className="button" href="/club">
              با باشگاه آشنا شوید <ArrowUpLeft size={19} />
            </Link>
          </div>
          <div className="club-invitation-path">
            <span>شرکت در نشست</span>
            <span>خلاصه دست‌نویس</span>
            <span>بازخورد استاد</span>
            <small>برای دانشجویان همه مقاطع · بدون تحویل کاغذی</small>
          </div>
        </section>
        <section className="section knowledge-section">
          <div className="knowledge-copy">
            <h2>
              دانش،
              <br />
              در دسترس شما.
            </h2>
            <p>
              نشریه مرتبط با پژوهش خود را پیدا کنید، راهنمای نویسندگان را
              بخوانید و به منابع علمی دانشگاه دسترسی داشته باشید.
            </p>
            <Link className="text-action" href="/journals">
              کاوش در نشریات <ArrowUpLeft size={18} />
            </Link>
            <Link className="text-action" href="/resources">
              کتابخانه و منابع علمی <ArrowUpLeft size={18} />
            </Link>
          </div>
          <div className="journal-shelf">
            {journals.slice(2, 5).map((j) => (
              <Link href="/journals" key={j.id}>
                <img
                  src={j.editorial?.image}
                  alt={`جلد ${j.title}`}
                  loading="lazy"
                  width="240"
                  height="340"
                />
                <span>{j.title}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="section split editorial-updates">
          <div>
            <h2>فرصت‌های پژوهشی</h2>
            {opportunities.length ? (
              opportunities.slice(0, 3).map((o) => (
                <article className="resource-row" key={o.id}>
                  <Link href={`/opportunities/${o.id}`}>{o.title}</Link>
                </article>
              ))
            ) : (
              <p>
                فراخوان‌ها و فرصت‌های همکاری پس از انتشار معاونت پژوهشی، اینجا
                در دسترس خواهند بود.
              </p>
            )}
            <Link className="text-action" href="/opportunities">
              مشاهده فرصت‌ها <ArrowUpLeft size={17} />
            </Link>
          </div>
          <div>
            <h2>خبرها و دستاوردها</h2>
            {news.length ? (
              news.slice(0, 3).map((n) => (
                <article className="resource-row" key={n.id}>
                  <Link href={`/news/${n.id}`}>{n.title}</Link>
                </article>
              ))
            ) : (
              <p>
                روایت فعالیت‌ها و دستاوردهای پژوهشی دانشکدگان، پس از تأیید و
                انتشار مسئول مربوط.
              </p>
            )}
            <Link className="text-action" href="/news">
              مشاهده خبرها <ArrowUpLeft size={17} />
            </Link>
          </div>
        </section>
      </div>
      <GroupRibbon />
      <section className="container section faq-section">
        <div>
          <h2>پرسشی مانده؟</h2>
          <p>چند پاسخ کوتاه، پیش از شروع.</p>
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
