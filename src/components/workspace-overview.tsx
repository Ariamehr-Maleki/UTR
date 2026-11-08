import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowUpLeft,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { type WorkspaceRole, roleDescriptions } from "@/lib/workspace-roles";
import { persianDate } from "@/lib/time";
export async function WorkspaceOverview({
  db,
  userId,
  role,
}: {
  db: SupabaseClient;
  userId: string;
  role: WorkspaceRole;
}) {
  const actions: {
    title: string;
    description: string;
    href: string;
    count?: number;
    icon: typeof Users;
  }[] = [];
  let error = false;
  if (role === "instructor") {
    const [reviews, courses] = await Promise.all([
      db
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("instructor_id", userId)
        .eq("active", true),
      db
        .from("offerings")
        .select("id", { count: "exact", head: true })
        .eq("instructor_id", userId)
        .eq("approved", true),
    ]);
    error = !!(reviews.error || courses.error);
    actions.push(
      {
        title: "خلاصه‌های در انتظار نظر شما",
        description:
          "نسخهٔ ارسالی را بخوانید و بازخورد یا نتیجهٔ ارزیابی را ثبت کنید.",
        href: "/workspace/review",
        count: reviews.count ?? 0,
        icon: ClipboardCheck,
      },
      {
        title: "درس‌های تأییدشدهٔ من",
        description: "ارتباط درس‌ها با رویدادها و گزارش پرونده‌های هر درس.",
        href: "/workspace/teaching",
        count: courses.count ?? 0,
        icon: FileCheck2,
      },
    );
  } else if (role === "admin") {
    const [members, appeals, events] = await Promise.all([
      db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("membership", "pending"),
      db
        .from("appeals")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      db
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
    ]);
    error = !!(members.error || appeals.error || events.error);
    actions.push(
      {
        title: "درخواست‌های عضویت",
        description: "مشخصات دانشگاهی را بررسی و وضعیت عضویت را تعیین کنید.",
        href: "/workspace/admin?operation=membership",
        count: members.count ?? 0,
        icon: Users,
      },
      {
        title: "درخواست‌های رسیدگی",
        description: "اعتراض‌ها و مسائل حضور یا ارزیابی؛ با پاسخ مستند.",
        href: "/workspace/admin?operation=appeal",
        count: appeals.count ?? 0,
        icon: ClipboardCheck,
      },
      {
        title: "رویدادهای آمادهٔ بررسی",
        description:
          "زمان، فرم، سیاست و درس‌های مرتبط را پیش از انتشار بررسی کنید.",
        href: "/workspace/admin?operation=event",
        count: events.count ?? 0,
        icon: CalendarDays,
      },
    );
  } else if (role === "superadmin") {
    actions.push(
      {
        title: "نقش‌ها و محدودهٔ دسترسی",
        description: "مدیریت حساب‌های مسئول و دسترسی‌های تأییدشده.",
        href: "/workspace/admin?operation=role",
        icon: ShieldCheck,
      },
      {
        title: "سابقهٔ تغییرات",
        description: "مشاهدهٔ عامل، زمان و دلیل تغییرات حساس سامانه.",
        href: "/workspace/audit",
        icon: ClipboardCheck,
      },
    );
  }
  return (
    <div className="desk-overview">
      <p className="desk-intro">{roleDescriptions[role]}</p>
      <div className="desk-date">
        <CalendarDays size={18} aria-hidden="true" />
        {persianDate(new Date())}
      </div>
      {error ? (
        <div className="notice error" role="alert">
          دریافت صف کارها انجام نشد. صفحه را دوباره بارگذاری کنید؛ تعدادها قابل
          اتکا نیستند.
        </div>
      ) : (
        <div className="desk-queue">
          {actions.map(({ title, description, href, count, icon: Icon }) => (
            <Link
              href={`${href}${href.includes("?") ? "&" : "?"}role=${role}`}
              key={href}
              className="desk-task"
            >
              <Icon size={24} aria-hidden="true" />
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
              {count !== undefined && (
                <span className="desk-count">
                  {count.toLocaleString("fa-IR")} مورد
                </span>
              )}
              <ArrowUpLeft size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
      {role === "admin" && (
        <section className="desk-shortcuts">
          <h2>آماده‌سازی و ادارهٔ باشگاه</h2>
          <nav aria-label="کارهای معاونت">
            {[
              ["instructor", "تأیید استاد"],
              ["semester", "نیمسال تحصیلی"],
              ["offering", "درس و استاد"],
              ["enrollment", "انتخاب درس دانشجو"],
              ["relevance", "ارتباط درس و رویداد"],
              ["attendance", "ثبت حضور"],
              ["content", "محتوا و منابع"],
            ].map(([op, label]) => (
              <Link
                key={op}
                href={`/workspace/admin?operation=${op}&role=admin`}
              >
                {label}
                <ArrowUpLeft size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </section>
      )}
      <section className="desk-guidance">
        <h2>
          {role === "instructor"
            ? "مسیر ارزیابی"
            : role === "admin"
              ? "مسیر یک پرونده"
              : "مرز اختیارها"}
        </h2>
        <p>
          {role === "instructor"
            ? "بررسی حضور و نسخهٔ فایل، مطالعهٔ خلاصه، بازخورد کتبی و ثبت نتیجه. هر امتیاز مثبت، حتی کسری از یک، ارجاع دوبارهٔ دانشجو را قفل می‌کند."
            : role === "admin"
              ? "عضویت و درس تأییدشده ← حضور در رویداد مصوب ← خلاصهٔ دست‌نویس ← ارزیابی استاد ← پیگیری نتیجه یا رسیدگی اداری."
              : "مدیریت فنی به‌تنهایی مجوز تأیید دانشجو، ثبت ارزیابی یا اصلاح نتیجهٔ علمی نیست. این کارها به نقش پژوهشیِ مستقل نیاز دارند."}
        </p>
      </section>
    </div>
  );
}
