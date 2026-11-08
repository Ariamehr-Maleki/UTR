import Link from "next/link";
import { GroupRibbon } from "@/components/group-ribbon";
import {
  CalendarCheck,
  PenLine,
  MessageSquareText,
  ArrowUpLeft,
  Check,
} from "lucide-react";
export default function Club() {
  return (
    <>
      <section className="club-hero">
        <div className="container club-hero-grid">
          <div>
            <h1 className="club-slogan">
              یک نشست،
              <br />
              یک خلاصه،
              <br />
              یک قدم جلوتر.
            </h1>
            <p>
              در باشگاه پژوهشیاران، از شنیدن یک ایده تا نوشتن برداشت خودتان؛
              مسیری برای مشارکت در پژوهش و دریافت بازخورد استاد.
            </p>
            <div className="actions">
              <Link className="button" href="/auth/register">
                درخواست عضویت <ArrowUpLeft size={19} />
              </Link>
              <a href="#club-path">مسیر مشارکت را ببینید</a>
            </div>
          </div>
          <div className="club-manifest">
            <img src="/assets/ut-emblem.png" alt="" width="85" height="85" />
            <p>
              دانشکدگان فارابی
              <br />
              دانشگاه تهران
            </p>
            <div className="manifest-line" />
            <strong>
              پرسش را دنبال کن.
              <br />
              برداشتت را بنویس.
            </strong>
            <span>ویژه دانشجویان کارشناسی، کارشناسی ارشد و دکتری</span>
          </div>
        </div>
      </section>
      <GroupRibbon />
      <div className="container">
        <section className="section" id="club-path">
          <div className="section-heading">
            <div>
              <h2>سه قدم، یک تجربه پژوهشی</h2>
              <p>همه مراحل در سامانه؛ بدون تحویل نسخه کاغذی.</p>
            </div>
            <Link href="/events">کاوش در رویدادها</Link>
          </div>
          <ol className="club-journey">
            {[
              [
                CalendarCheck,
                "در نشست شرکت کنید",
                "رویداد باید تأیید باشگاه را داشته باشد و حضور شما توسط مسئول رویداد ثبت شود.",
              ],
              [
                PenLine,
                "برداشت خود را بنویسید",
                "یک صفحه دست‌نویس خوانا روی فرم رسمی؛ تصویر یا اسکن را تا جمعه همان هفته، ساعت ۲۳:۵۹:۵۹ به وقت تهران بارگذاری کنید.",
              ],
              [
                MessageSquareText,
                "بازخورد استاد را بگیرید",
                "یک درس مرتبط از نیمسال جاری و استاد تأییدشده آن را انتخاب کنید. استاد برای همین رویداد از صفر تا یک امتیاز تعیین می‌کند.",
              ],
            ].map(([Icon, title, text], i) => {
              const I = Icon as typeof CalendarCheck;
              return (
                <li key={i}>
                  <span className="journey-number">
                    {(i + 1).toLocaleString("fa-IR")}
                  </span>
                  <I size={30} />
                  <h3>{title as string}</h3>
                  <p>{text as string}</p>
                </li>
              );
            })}
          </ol>
        </section>
        <section className="club-rules">
          <div>
            <h2>
              پیش از شروع،
              <br />
              این چند نکته را بدانید.
            </h2>
            <Link className="text-action" href="/policy">
              مطالعه کامل قوانین <ArrowUpLeft size={18} />
            </Link>
          </div>
          <div>
            {[
              [
                "یک رویداد، یک درس",
                "هر رویداد فقط به یک درس و استاد تخصیص می‌یابد. درس باید مرتبط و متعلق به نیمسال جاری شما باشد.",
              ],
              [
                "امتیاز کامل، تضمین نیست",
                "حداکثر یک امتیاز برای هر رویداد است، نه برای کل نیمسال؛ اعمال مجموع آن در نمره رسمی تابع مقررات آموزشی است.",
              ],
              [
                "امتیاز مثبت، ارجاع را می‌بندد",
                "فقط امتیاز دقیقاً صفر امکان ارجاع به استاد واجد شرایط دیگر را فراهم می‌کند. امتیاز کسری مثبت نیز قفل ایجاد می‌کند.",
              ],
              [
                "اصلاح با همان استاد",
                "اصلاح نزد همان استاد انجام می‌شود. در سیاست نسخهٔ دوم، پس از تصمیم دیرهنگام استاد ۷۲ ساعت فرصت اصلاح یا ارجاع پس از صفر دارید و حداکثر دو ارجاع جایگزین مجاز است. تغییر فایل یا مشخصات، قفل امتیاز مثبت را باز نمی‌کند.",
              ],
            ].map(([title, text]) => (
              <div className="rule-line" key={title}>
                <Check size={20} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="join-strip">
          <div>
            <h2>قدم بعدی شما چیست؟</h2>
            <p>
              با قوانین آشنا شوید و رویدادهای مرتبط با مسیر تحصیلی‌تان را پیدا
              کنید.
            </p>
          </div>
          <Link className="button" href="/events">
            مشاهده رویدادها <ArrowUpLeft size={18} />
          </Link>
        </section>
      </div>
    </>
  );
}
