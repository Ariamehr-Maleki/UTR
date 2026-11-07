import { notFound } from "next/navigation";
import Link from "next/link";
import { publicRecords } from "@/lib/data";
import { persianDate } from "@/lib/time";
export default async function Event({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = (await publicRecords("events")).find((x) => x.id === id);
  if (!e) notFound();
  return (
    <article className="container content prose">
      <header className="page-head">
        <h1>{e.title}</h1>
        {e.club_approved && (
          <span className="badge">تأییدشده باشگاه پژوهشیاران</span>
        )}
      </header>
      {e.status === "cancelled" && (
        <div className="notice">
          این رویداد لغو شده است. برای پیگیری ثبت‌نام یا پرونده خود به فضای کار
          مراجعه کنید.
        </div>
      )}
      <p>{e.description}</p>
      <dl>
        <dt>زمان برگزاری</dt>
        <dd>{e.starts_at && persianDate(e.starts_at)}</dd>
        {e.speaker && (
          <>
            <dt>سخنران</dt>
            <dd>{e.speaker}</dd>
          </>
        )}
        {e.organizer && (
          <>
            <dt>برگزارکننده</dt>
            <dd>{e.organizer}</dd>
          </>
        )}
        {e.capacity && (
          <>
            <dt>ظرفیت</dt>
            <dd>{e.capacity.toLocaleString("fa-IR")}</dd>
          </>
        )}
        {e.registration_closes && (
          <>
            <dt>پایان ثبت‌نام</dt>
            <dd>{persianDate(e.registration_closes)}</dd>
          </>
        )}
        <dt>محل برگزاری</dt>
        <dd>{e.venue}</dd>
        <dt>مهلت ارسال خلاصه</dt>
        <dd>
          {e.summary_deadline
            ? persianDate(e.summary_deadline)
            : "هنوز تعیین نشده است"}
        </dd>
      </dl>
      {e.online_url?.startsWith("https://") && (
        <p>
          <a href={e.online_url} rel="noopener noreferrer" target="_blank">
            اطلاعات حضور آنلاین
          </a>
        </p>
      )}
      <Link className="button" href={`/workspace/events?event=${e.id}`}>
        ثبت‌نام و پیگیری حضور
      </Link>
      <div className="notice">
        ثبت‌نام به معنای تأیید حضور نیست. حضور توسط مسئول رویداد ثبت می‌شود.
      </div>
    </article>
  );
}
