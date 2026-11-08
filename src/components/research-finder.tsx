"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, X, ArrowUpLeft, ExternalLink } from "lucide-react";
import type { RecordItem } from "@/lib/data";
const labels: Record<string, string> = {
  event_archive: "آرشیو رویداد",
  journals: "نشریه",
  resources: "منبع علمی",
  news: "خبر",
  opportunities: "فرصت پژوهشی",
};
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]+/g, " ")
    .trim();
export function ResearchFinder({ records }: { records: RecordItem[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [searched, setSearched] = useState(false);
  const [limit, setLimit] = useState(8);
  useEffect(() => setLimit(8), [query, kind]);
  const results = useMemo(
    () =>
      records.filter(
        (r) =>
          (kind === "all" || r.kind === kind) &&
          normalize(
            `${r.title} ${r.editorial?.speaker || ""} ${r.editorial?.topic || ""}`,
          ).includes(normalize(query)),
      ),
    [records, query, kind],
  );
  const visible = searched || query.trim().length > 0;
  return (
    <div className="research-finder">
      <form
        className="finder-form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQuery("");
            setSearched(false);
          }
        }}
      >
        <Search size={25} aria-hidden="true" />
        <input
          aria-label="جست‌وجو در UTR"
          placeholder="چه چیزی می‌خواهید پیدا کنید؟"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          aria-controls="finder-results"
        />
        {query && (
          <button
            className="finder-clear"
            type="button"
            aria-label="پاک کردن جست‌وجو"
            onClick={() => {
              setQuery("");
              setSearched(false);
            }}
          >
            <X size={20} />
          </button>
        )}
        <select
          aria-label="نوع محتوا"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setSearched(true);
          }}
        >
          <option value="all">همه محتوا</option>
          <option value="event_archive">رویدادها</option>
          <option value="journals">نشریات</option>
          <option value="resources">منابع علمی</option>
        </select>
        <button className="finder-submit" type="submit">
          جست‌وجو <ArrowUpLeft size={20} />
        </button>
      </form>
      {!visible && (
        <div className="finder-suggestions">
          <span>برای شروع:</span>
          {["هوش مصنوعی", "مقاله", "مدیریت"].map((q) => (
            <button key={q} onClick={() => setQuery(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
      {visible && (
        <section
          className="finder-results"
          id="finder-results"
          aria-label="نتایج جست‌وجوی UTR"
        >
          <div className="finder-result-heading">
            <p role="status">
              {results.length.toLocaleString("fa-IR")} نتیجه
              {results.length > limit
                ? `؛ نمایش ${limit.toLocaleString("fa-IR")} مورد نخست`
                : ""}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setSearched(false);
                setKind("all");
              }}
            >
              بستن نتایج <X size={16} />
            </button>
          </div>
          {results.slice(0, limit).map((r) => {
            const external = r.kind === "journals" || r.kind === "resources";
            const href =
              r.kind === "event_archive"
                ? `/events/archive/${r.id}`
                : external
                  ? r.external_url || "/resources"
                  : `/${r.kind}/${r.id}`;
            return (
              <Link
                key={r.id}
                className="finder-result"
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                <span>
                  <strong dir="auto">{r.title}</strong>
                  <small>
                    {labels[r.kind || ""]}{" "}
                    {r.editorial?.year && <bdi>{r.editorial.year}</bdi>}
                  </small>
                </span>
                {external ? (
                  <ExternalLink size={19} />
                ) : (
                  <ArrowUpLeft size={21} />
                )}
              </Link>
            );
          })}
          {results.length > limit && (
            <button className="finder-more" onClick={() => setLimit(limit + 8)}>
              نمایش نتایج بیشتر
            </button>
          )}
          {!results.length && (
            <p className="finder-no-results">
              نتیجه‌ای پیدا نشد. عبارت کوتاه‌تر یا نوع محتوای دیگری را امتحان
              کنید.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
