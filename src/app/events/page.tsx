import { Calendar } from "@/components/calendar";
import { publicRecords } from "@/lib/data";
export default async function Events() {
  return (
    <div className="container content">
      <header className="page-head">
        <h1>تقویم رویدادهای علمی</h1>
        <p>
          برنامه نشست‌ها، وضعیت ثبت‌نام و مهلت ارسال خلاصه؛ همه زمان‌ها به وقت
          تهران.
        </p>
      </header>
      <Calendar
        events={await publicRecords("events")}
        now={new Date().toISOString()}
      />
    </div>
  );
}
