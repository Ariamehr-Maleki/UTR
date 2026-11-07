"use client";
import { useState } from "react";
import {
  ArrowUpLeft,
  Search,
  BookOpen,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { RecordItem } from "@/lib/data";
export function EditorialDirectory({
  records,
  kind,
}: {
  records: RecordItem[];
  kind: "journals" | "resources";
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("همه");
  const topics = [
    ...new Set(records.map((r) => r.editorial?.topic).filter(Boolean)),
  ];
  const rows = records
    .filter(
      (r) =>
        (topic === "همه" || r.editorial?.topic === topic) &&
        (r.title + " " + r.editorial?.topic)
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (a.editorial?.order || 0) - (b.editorial?.order || 0));
  return (
    <>
      <div className="directory-tools">
        <label className="search-field">
          <Search size={20} />
          <input
            aria-label={
              kind === "journals" ? "جست‌وجوی نشریه" : "جست‌وجوی منابع"
            }
            placeholder={
              kind === "journals"
                ? "نام نشریه یا حوزه علمی"
                : "چه منبعی نیاز دارید؟"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="topic-filters" aria-label="حوزه‌ها">
          {["همه", ...topics].map((t) => (
            <button
              key={t}
              aria-pressed={topic === t}
              onClick={() => setTopic(t!)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {kind === "journals" ? (
        <div className="journal-grid">
          {rows.map((r) => (
            <article className="journal-card" key={r.id}>
              <a
                className="journal-cover"
                href={r.external_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.editorial?.image ? (
                  <img
                    src={r.editorial.image}
                    alt={`جلد نشریه ${r.title}`}
                    loading="lazy"
                    width="240"
                    height="340"
                  />
                ) : (
                  <BookOpen size={80} />
                )}
              </a>
              <div className="journal-body">
                <span className="journal-subject">{r.editorial?.topic}</span>
                <h2 dir="auto">{r.title}</h2>
                <a
                  className="text-action"
                  href={r.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ورود به سامانه نشریه <ArrowUpLeft size={18} />
                </a>
                <details>
                  <summary>اطلاعات و ارتباط با دفتر</summary>
                  <p>{r.description}</p>
                  {r.editorial?.email && (
                    <a href={`mailto:${r.editorial.email}`}>
                      <bdi>{r.editorial.email}</bdi>
                    </a>
                  )}
                  {r.editorial?.phone && (
                    <p>
                      <a href={`tel:${r.editorial.phone}`}>
                        <bdi>{r.editorial.phone}</bdi>
                      </a>
                    </p>
                  )}
                </details>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="library-resources">
          {rows.map((r) => (
            <article key={r.id}>
              <div className="resource-symbol">
                {r.editorial?.topic === "منابع دیجیتال" ? (
                  <BookOpen />
                ) : (
                  <FileText />
                )}
              </div>
              <div>
                <span className="journal-subject">{r.editorial?.topic}</span>
                <h2>{r.title}</h2>
                <p>{r.description}</p>
              </div>
              <a
                className="resource-visit"
                href={r.external_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`دسترسی به ${r.title}`}
              >
                <ExternalLink size={20} />
                <span>دسترسی</span>
              </a>
            </article>
          ))}
        </div>
      )}
      {!rows.length && (
        <div className="empty">
          <h2>نتیجه‌ای پیدا نشد</h2>
          <button
            onClick={() => {
              setQuery("");
              setTopic("همه");
            }}
          >
            نمایش همه موارد
          </button>
        </div>
      )}
    </>
  );
}
