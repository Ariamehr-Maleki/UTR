import { notFound } from "next/navigation";
import Link from "next/link";
import { publicRecords } from "@/lib/data";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ArrowUpLeft,
} from "lucide-react";
export default async function ArchiveDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = (await publicRecords("content", "event_archive")).find(
    (r) => r.id === id,
  );
  if (!record) notFound();
  const e = record.editorial;
  return (
    <div className="container content">
      <Link className="back-link" href="/events">
        بازگشت به آرشیو رویدادها
      </Link>
      <div className="archive-detail">
        <div>
          <span className="badge">
            آرشیو سال تحصیلی{" "}
            <bdi>{e?.year?.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}</bdi>
          </span>
          <h1>{record.title}</h1>
          <p>{record.description}</p>
          <dl className="event-facts">
            <div>
              <dt>
                <CalendarDays size={19} />
                تاریخ
              </dt>
              <dd>{e?.date}</dd>
            </div>
            <div>
              <dt>
                <Clock3 size={19} />
                زمان اعلام‌شده
              </dt>
              <dd>{e?.time}، به وقت تهران</dd>
            </div>
            <div>
              <dt>
                <UserRound size={19} />
                ارائه‌دهنده
              </dt>
              <dd>{e?.speaker}</dd>
            </div>
            <div>
              <dt>
                <MapPin size={19} />
                محل برگزاری
              </dt>
              <dd>{e?.venue}</dd>
            </div>
          </dl>
          <div className="notice">
            این صفحه آرشیوی است. ثبت‌نام، گواهی و امتیاز جدید برای این برنامه از
            طریق UTR صادر نمی‌شود.
          </div>
          <a
            className="text-action"
            href={record.external_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            منبع رسمی برنامه <ArrowUpLeft size={18} />
          </a>
        </div>
        <figure>
          <a href={e?.image} target="_blank" rel="noopener noreferrer">
            <img
              src={e?.image}
              alt={`پوستر کامل ${record.title}`}
              width="1000"
              height="1415"
            />
          </a>
          <figcaption>
            پوستر رسمی برنامه؛ برای مشاهده در اندازه کامل روی تصویر بزنید.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
