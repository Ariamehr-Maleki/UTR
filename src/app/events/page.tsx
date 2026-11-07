import { Calendar } from "@/components/calendar";
import { AcademicArchive } from "@/components/academic-archive";
import { publicRecords } from "@/lib/data";
export default async function Events() {
  const [events, archive] = await Promise.all([
    publicRecords("events"),
    publicRecords("content", "event_archive"),
  ]);
  return (
    <div className="container content">
      <header className="page-head editorial-head">
        <div>
          <h1>
            قرارهای علمی،
            <br />
            مسیرهای تازه.
          </h1>
          <p>
            کارگاه‌ها و نشست‌های پژوهشی دانشکدگان فارابی؛ یک آرشیو برای مرور،
            یادگیری و پیدا کردن مسیر بعدی.
          </p>
        </div>
        <a className="button secondary" href="#current-calendar">
          تقویم جاری و ثبت‌نام
        </a>
      </header>
      <AcademicArchive records={archive} />
      <section className="section" id="current-calendar">
        <div className="section-heading">
          <div>
            <h2>تقویم رویدادهای علمی</h2>
            <p>برنامه‌های جاری و مهلت ارسال خلاصه؛ همه زمان‌ها به وقت تهران.</p>
          </div>
        </div>
        <Calendar events={events} now={new Date().toISOString()} />
      </section>
    </div>
  );
}
