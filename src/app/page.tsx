import Link from "next/link";
import {
  CalendarDays,
  BookOpen,
  GraduationCap,
  Library,
  ArrowUpLeft,
} from "lucide-react";
import { publicRecords } from "@/lib/data";
import { inWeek } from "@/lib/time";
export default async function Home() {
  const [allEvents, news, opportunities] = await Promise.all([
    publicRecords("events"),
    publicRecords("content", "news"),
    publicRecords("content", "opportunities"),
  ]);
  const events = allEvents
    .filter((e) => e.status === "published")
    .filter((e) => e.starts_at && inWeek(e.starts_at, new Date()));
  const upcoming = allEvents.filter(
    (e) => e.starts_at && new Date(e.starts_at) > new Date(),
  );
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              پژوهش، از یک پرسش
              <br />
              تا یک گام رو به جلو.
            </h1>
            <p>
              پلتفرم جامع معاونت پژوهش و فناوری دانشکدگان فارابی دانشگاه تهران؛
              نقطه دسترسی شما به رویدادها، فرصت‌ها و منابع پژوهشی.
            </p>
            <div className="actions">
              <Link className="button" href="/events">
                کاوش در رویدادها <ArrowUpLeft size={18} />
              </Link>
              <Link className="button secondary" href="/club">
                آشنایی با باشگاه پژوهشیاران
              </Link>
            </div>
            <p className="hero-note">ویژه جامعه دانشگاهی دانشکدگان فارابی</p>
          </div>
          <div className="hero-art">
            <img
              src="/assets/ut-emblem.png"
              alt="دانشگاه تهران"
              width="310"
              height="310"
            />
          </div>
        </div>
      </section>
      <div className="container">
        <div className="service-links">
          {[
            [CalendarDays, "رویدادهای علمی", "/events"],
            [GraduationCap, "فرصت‌های پژوهشی", "/opportunities"],
            [BookOpen, "نشریات علمی", "/journals"],
            [Library, "کتابخانه و منابع", "/resources"],
          ].map(([Icon, label, href]) => {
            const I = Icon as typeof CalendarDays;
            return (
              <Link href={href as string} key={href as string}>
                <I size={25} />
                <span>{label as string}</span>
                <ArrowUpLeft size={16} />
              </Link>
            );
          })}
        </div>
        <section className="section">
          <div className="section-heading">
            <div>
              <h2>این هفته در UTR</h2>
              <p>
                فرصت‌های پیش رو و نشست‌هایی که مهلت ارسال خلاصه آن‌ها باز است.
              </p>
            </div>
            <Link href="/events">تقویم رویدادها</Link>
          </div>
          {events.length ? (
            events.slice(0, 3).map((e) => (
              <article className="resource-row" key={e.id}>
                <Link href={`/events/${e.id}`}>{e.title}</Link>
                <span>{e.description}</span>
              </article>
            ))
          ) : (
            <div className="empty">
              <strong>برنامه این هفته به‌زودی منتشر می‌شود</strong>
              <p>
                رویدادهای تأییدشده پس از انتشار معاونت پژوهشی، همراه با زمان
                برگزاری و مهلت ارسال خلاصه در این بخش قرار می‌گیرند.
              </p>
              <Link href="/events">مشاهده همه رویدادها</Link>
            </div>
          )}
        </section>
        <section className="section" style={{ paddingTop: 0 }}>
          <h2>رویدادهای پیش رو</h2>
          {upcoming.length ? (
            upcoming.slice(0, 4).map((e) => (
              <article className="resource-row" key={e.id}>
                <Link href={`/events/${e.id}`}>{e.title}</Link>
              </article>
            ))
          ) : (
            <p className="muted">
              رویداد تازه‌ای برای روزهای آینده منتشر نشده است.
            </p>
          )}
        </section>
        <section className="club-panel">
          <div>
            <h2>باشگاه پژوهشیاران</h2>
            <p style={{ fontSize: 22 }}>«یک نشست، یک خلاصه، یک قدم جلوتر»</p>
            <p>
              در یک رویداد علمی شرکت کنید، برداشت خود را بنویسید و با بازخورد
              استاد، مسیر پژوهش را ادامه دهید.
            </p>
            <Link className="button" href="/club">
              قوانین و مسیر عضویت
            </Link>
          </div>
          <ol className="steps">
            <li>
              در نشست تأییدشده شرکت کنید
              <small>حضور شما توسط مسئول رویداد تأیید می‌شود.</small>
            </li>
            <li>
              خلاصه دست‌نویس را بارگذاری کنید
              <small>یک صفحه خوانا، روی فرم رسمی باشگاه.</small>
            </li>
            <li>
              بازخورد استاد مرتبط را دریافت کنید
              <small>
                ارزیابی هر رویداد از صفر تا یک؛ بدون تضمین امتیاز کامل.
              </small>
            </li>
          </ol>
        </section>
        <section className="section split">
          <div>
            <div className="section-heading">
              <h2>فرصت‌های پژوهشی</h2>
              <Link href="/opportunities">همه فرصت‌ها</Link>
            </div>
            <p className="muted">
              فراخوان‌ها، همکاری‌های پژوهشی و مسیرهای تازه یادگیری؛ پس از بررسی
              و انتشار معاونت پژوهشی.
            </p>
            {opportunities.slice(0, 3).map((item) => (
              <article className="resource-row" key={item.id}>
                <Link href={`/opportunities/${item.id}`}>{item.title}</Link>
              </article>
            ))}
            <Link href="/opportunities">جست‌وجوی فرصت‌های منتشرشده</Link>
          </div>
          <div>
            <h2>دانش در دسترس</h2>
            <div className="resource-row">
              <div>
                <h3>نشریات علمی</h3>
                <p>راهنمای نشریات و مسیر دسترسی به خدمات رسمی</p>
              </div>
              <Link href="/journals" aria-label="مشاهده نشریات">
                <ArrowUpLeft />
              </Link>
            </div>
            <div className="resource-row">
              <div>
                <h3>کتابخانه و منابع علمی</h3>
                <p>منابع منتخب و ابزارهای موردنیاز پژوهش</p>
              </div>
              <Link href="/resources" aria-label="مشاهده منابع">
                <ArrowUpLeft />
              </Link>
            </div>
          </div>
        </section>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-heading">
            <h2>خبرها و دستاوردهای پژوهشی</h2>
            <Link href="/news">همه خبرها</Link>
          </div>
          {news.length ? (
            news.slice(0, 3).map((item) => (
              <article className="resource-row" key={item.id}>
                <Link href={`/news/${item.id}`}>{item.title}</Link>
              </article>
            ))
          ) : (
            <div className="empty">
              <strong>روایت پژوهش‌های دانشکدگان</strong>
              <p>
                خبرها و دستاوردهای تأییدشده پس از انتشار در این بخش قابل مشاهده
                خواهند بود.
              </p>
            </div>
          )}
        </section>
        <section className="section" style={{ paddingTop: 0 }}>
          <h2>گروه‌های مشارکت‌کننده</h2>
          <div className="groups">
            <span>گروه کامپیوتر دانشکده مهندسی</span>
            <span>گروه مدیریت دولتی دانشکده مدیریت و حسابداری</span>
            <span>گروه صنایع دانشکده مهندسی</span>
          </div>
        </section>
        <section className="section" style={{ paddingTop: 0 }}>
          <h2>پرسش‌های متداول</h2>
          {[
            [
              "چه کسانی می‌توانند عضو باشگاه شوند؟",
              "دانشجویان کارشناسی، کارشناسی ارشد و دکتری، پس از تکمیل پروفایل و تأیید وضعیت دانشجویی.",
            ],
            [
              "آیا برای هر نشست یک امتیاز کامل دریافت می‌کنم؟",
              "خیر. استاد برای هر رویداد از صفر تا یک امتیاز تعیین می‌کند. امتیاز مثبت حتی به‌صورت کسری، امکان ارجاع به استاد دیگر را می‌بندد.",
            ],
            [
              "آیا تحویل نسخه کاغذی لازم است؟",
              "خیر. تصویر یا اسکن خوانای خلاصه یک‌صفحه‌ای روی فرم رسمی باشگاه را در سامانه بارگذاری می‌کنید.",
            ],
            [
              "امتیاز باشگاه چگونه در نمره درس اعمال می‌شود؟",
              "امتیاز باشگاه با ثبت نمره در سامانه رسمی دانشگاه متفاوت است. اعمال امتیازهای تجمیعی تابع مقررات آموزشی مؤسسه است.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
