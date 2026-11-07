"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, CalendarDays, Search, Clock3 } from "lucide-react";
import type { RecordItem } from "@/lib/data";
export function AcademicArchive({ records }: { records: RecordItem[] }) {
  const [year, setYear] = useState("1404-1405");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("همه موضوع‌ها");
  const normalize = (s: string) =>
    s.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").trim();
  const topics = [
    ...new Set(records.map((r) => r.editorial?.topic).filter(Boolean)),
  ] as string[];
  const selected = records
    .filter((r) => r.editorial?.year === year)
    .sort((a, b) => (a.editorial?.order || 0) - (b.editorial?.order || 0));
  const shown = selected.filter(
    (r) =>
      (topic === "همه موضوع‌ها" || r.editorial?.topic === topic) &&
      normalize(r.title + " " + r.editorial?.speaker).includes(
        normalize(query),
      ),
  );
  return (
    <section className="archive" aria-label="آرشیو سال تحصیلی">
      <div className="year-switch" aria-label="سال تحصیلی">
        {[
          ["1403-1404", "۱۴۰۳–۱۴۰۴"],
          ["1404-1405", "۱۴۰۴–۱۴۰۵"],
          ["1405-1406", "۱۴۰۵–۱۴۰۶"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={year === value}
            onClick={() => {
              setYear(value);
              setQuery("");
              setTopic("همه موضوع‌ها");
            }}
          >
            <bdi>{label}</bdi>
            <small>
              {value === "1405-1406" ? "به‌زودی" : "آرشیو برنامه‌ها"}
            </small>
          </button>
        ))}
      </div>
      {year === "1405-1406" ? (
        <div className="coming-soon">
          <CalendarDays size={56} strokeWidth={1.25} />
          <h2>فصل تازه پژوهش، به‌زودی</h2>
          <p>
            برنامه‌های سال تحصیلی <bdi>۱۴۰۵–۱۴۰۶</bdi> در این بخش منتشر می‌شوند.
          </p>
          <button
            className="button secondary"
            onClick={() => setYear("1404-1405")}
          >
            مرور برنامه‌های سال گذشته
          </button>
        </div>
      ) : (
        <>
          <div className="archive-toolbar">
            <div>
              <h2>مجموعه برنامه‌های پژوهشی</h2>
              <p>
                {year === "1403-1404"
                  ? "۱۳ آبان تا ۶ آذر ۱۴۰۳"
                  : "۲۰ آبان تا ۲ دی ۱۴۰۴"}{" "}
                <span className="dot-divider" />{" "}
                {selected.length.toLocaleString("fa-IR")} برنامه در آرشیو
              </p>
            </div>
            <div className="archive-search">
              <label>
                <Search size={19} />
                <input
                  aria-label="جست‌وجو در آرشیو"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="عنوان یا نام ارائه‌دهنده"
                />
              </label>
              <select
                aria-label="موضوع آرشیو"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option>همه موضوع‌ها</option>
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="archive-note">
            <Clock3 size={16} /> این برنامه‌ها متعلق به آرشیو هستند؛ ثبت‌نام و
            ارسال خلاصه برای آن‌ها فعال نیست.
          </p>
          <div className="poster-grid">
            {shown.map((r) => (
              <article className="poster-card" key={r.id}>
                <Link
                  className="poster-image"
                  href={`/events/archive/${r.id}`}
                  aria-label={`پوستر و جزئیات ${r.title}`}
                >
                  <img
                    src={r.editorial?.image}
                    alt={`پوستر ${r.title}`}
                    loading="lazy"
                    width="1000"
                    height="1415"
                  />
                  <span className="poster-open">
                    <ArrowUpLeft size={21} />
                  </span>
                </Link>
                <div className="poster-info">
                  <div className="poster-meta">
                    <span>{r.editorial?.date}</span>
                    <span>{r.editorial?.topic}</span>
                  </div>
                  <h3>
                    <Link href={`/events/archive/${r.id}`}>{r.title}</Link>
                  </h3>
                  <p>{r.editorial?.speaker}</p>
                </div>
              </article>
            ))}
          </div>
          {!shown.length && (
            <div className="empty">
              <h3>برنامه‌ای با این جست‌وجو پیدا نشد</h3>
              <button
                onClick={() => {
                  setQuery("");
                  setTopic("همه موضوع‌ها");
                }}
              >
                پاک‌کردن فیلترها
              </button>
            </div>
          )}
          <a
            className="source-link"
            href={`https://farabi.ut.ac.ir/fa/news/${year === "1403-1404" ? "43935" : "50799"}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            مشاهده مجموعه در وبگاه رسمی دانشکدگان <ArrowUpLeft size={17} />
          </a>
        </>
      )}
    </section>
  );
}
