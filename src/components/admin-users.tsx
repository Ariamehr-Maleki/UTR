import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { persianDate } from "@/lib/time";
import { UserApproval } from "@/components/user-approval";
import { statusLabel } from "@/lib/status";

type DirectoryRow = {
  id: string | null;
  email: string | null;
  display_name: string;
  student_number: string | null;
  degree: string | null;
  department_id: string | null;
  department_name: string | null;
  membership: string;
  requested_role: "student" | "instructor";
  role_approved: boolean;
  created_at: string;
  total_count: number;
  pending_count: number;
  approved_count: number;
};

const degreeNames: Record<string, string> = {
  bachelor: "کارشناسی",
  master: "کارشناسی ارشد",
  doctorate: "دکتری",
};
const roleName = (role: string) => (role === "instructor" ? "استاد" : "دانشجو");
function missing(row: DirectoryRow) {
  return [
    ...(!row.display_name?.trim() ? ["نام و نام خانوادگی"] : []),
    ...(!row.department_id ? ["گروه آموزشی"] : []),
    ...(row.requested_role === "student" && !row.student_number?.trim()
      ? ["شمارهٔ دانشجویی"]
      : []),
    ...(row.requested_role === "student" && !row.degree ? ["مقطع"] : []),
  ];
}
function href(status: string, role: string, q: string, page = 1) {
  const params = new URLSearchParams({ status, role });
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return `/workspace/users?${params}`;
}
export async function AdminUsers({
  db,
  query,
  id,
  canApprove,
}: {
  db: SupabaseClient;
  query: Record<string, string>;
  id?: string;
  canApprove: boolean;
}) {
  if (id) {
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id))
      return <div className="notice error">شناسهٔ کاربر معتبر نیست.</div>;
    const args = {
      p_role: "all",
      p_search: "",
      p_limit: 1,
      p_offset: 0,
      p_user: id,
    };
    const [pending, approved] = await Promise.all([
      db.rpc("admin_user_directory", { ...args, p_status: "pending" }),
      db.rpc("admin_user_directory", { ...args, p_status: "approved" }),
    ]);
    if (pending.error || approved.error)
      return (
        <div className="notice error" role="alert">
          پروفایل دریافت نشد. دسترسی و اتصال را بررسی کنید.
        </div>
      );
    const person = (
      [...(pending.data || []), ...(approved.data || [])] as DirectoryRow[]
    ).find((r) => r.id === id);
    if (!person)
      return (
        <div className="notice error">
          این کاربر در دامنهٔ مجاز شما یافت نشد.
        </div>
      );
    const { data: submissions, error: reportsError } =
      person.requested_role === "instructor"
        ? await db
            .from("referrals")
            .select(
              "id,created_at,submissions(id,state,events(title)),offerings(title)",
            )
            .eq("instructor_id", id)
            .order("created_at", { ascending: false })
        : await db
            .from("submissions")
            .select(
              "id,state,created_at,events(title),referrals(active,offerings(title),assessments(outcome,score,created_at))",
            )
            .eq("student_id", id)
            .order("created_at", { ascending: false });
    const { data: offerings, error: offeringsError } =
      person.requested_role === "instructor"
        ? await db
            .from("offerings")
            .select("id,title,approved,semesters(title)")
            .eq("instructor_id", id)
        : { data: [], error: null };
    const gaps = missing(person);
    return (
      <div className="operational-detail">
        <Link href="/workspace/users">← بازگشت به کاربران</Link>
        <header>
          <h2>{person.display_name || "نام تکمیل نشده"}</h2>
          <span className="badge">
            {person.membership === "approved" && person.role_approved
              ? "تأییدشده"
              : "در انتظار بررسی"}
          </span>
        </header>
        <dl className="review-summary">
          <div>
            <dt>درخواست نقش</dt>
            <dd>{roleName(person.requested_role)}</dd>
          </div>
          <div>
            <dt>ایمیل</dt>
            <dd>
              <bdi dir="ltr">{person.email}</bdi>
            </dd>
          </div>
          <div>
            <dt>گروه</dt>
            <dd>{person.department_name || "ثبت نشده"}</dd>
          </div>
          {person.requested_role === "student" && (
            <>
              <div>
                <dt>شمارهٔ دانشجویی</dt>
                <dd>
                  <bdi>{person.student_number || "ثبت نشده"}</bdi>
                </dd>
              </div>
              <div>
                <dt>مقطع</dt>
                <dd>{degreeNames[person.degree || ""] || "ثبت نشده"}</dd>
              </div>
            </>
          )}
          <div>
            <dt>تاریخ درخواست</dt>
            <dd>{persianDate(person.created_at)}</dd>
          </div>
        </dl>
        {person.membership !== "approved" || !person.role_approved ? (
          gaps.length ? (
            <p className="notice">
              پیش از تأیید، این موارد باید تکمیل و با مرجع دانشگاهی تطبیق داده
              شوند: {gaps.join("، ")}.
            </p>
          ) : (
            <UserApproval
              id={id}
              role={person.requested_role}
              enabled={canApprove}
            />
          )
        ) : null}
        <section>
          <h3>
            {person.requested_role === "instructor"
              ? "درس‌های تأییدشده و انتساب‌ها"
              : "گزارش‌های ثبت‌شده"}
          </h3>
          {reportsError || offeringsError ? (
            <p role="alert">دریافت سوابق انجام نشد. دوباره تلاش کنید.</p>
          ) : null}
          {person.requested_role === "instructor" &&
            (offerings?.length ? (
              <ul className="record-list">
                {offerings.map((o: any) => (
                  <li key={o.id}>
                    {o.title} · {o.semesters?.title || "نیمسال ثبت نشده"} ·{" "}
                    {o.approved ? "تأییدشده" : "در انتظار تأیید"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">درسی برای این استاد ثبت نشده است.</p>
            ))}
          {submissions?.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">رویداد</th>
                    <th scope="col">زمان</th>
                    <th scope="col">درس / استاد</th>
                    <th scope="col">وضعیت</th>
                    <th scope="col">پرونده</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s: any) => (
                    <tr key={s.id}>
                      <th scope="row">
                        {(s.submissions || s).events?.title || "رویداد"}
                      </th>
                      <td>{persianDate(s.created_at)}</td>
                      <td>
                        {s.offerings?.title ||
                          s.referrals?.at(-1)?.offerings?.title ||
                          "ارجاع نشده"}
                      </td>
                      <td>
                        {statusLabel[(s.submissions || s).state] ||
                          (s.submissions || s).state}
                      </td>
                      <td>
                        <Link
                          href={`/workspace/report/${s.submissions?.id || s.id}`}
                        >
                          مشاهده گزارش
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : person.requested_role === "student" ? (
            <p className="muted">هنوز گزارشی ثبت نشده است.</p>
          ) : null}
        </section>
      </div>
    );
  }

  const status = query.status === "approved" ? "approved" : "pending";
  const role = ["student", "instructor"].includes(query.filter)
    ? query.filter
    : "all";
  const q = (query.q || "").trim().slice(0, 120);
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const { data, error } = await db.rpc("admin_user_directory", {
    p_status: status,
    p_role: role,
    p_search: q,
    p_limit: 20,
    p_offset: (page - 1) * 20,
  });
  const rows = (data || []) as DirectoryRow[];
  const counts = rows[0] || {
    pending_count: 0,
    approved_count: 0,
    total_count: 0,
  };
  const people = rows.filter((r) => r.id);
  return (
    <div className="operational-list">
      <div className="queue-tabs" aria-label="وضعیت کاربران">
        <Link
          href={href("pending", role, q)}
          aria-current={status === "pending" ? "page" : undefined}
        >
          در انتظار تأیید ·{" "}
          {Number(counts.pending_count).toLocaleString("fa-IR")}
        </Link>
        <Link
          href={href("approved", role, q)}
          aria-current={status === "approved" ? "page" : undefined}
        >
          تأییدشده‌ها · {Number(counts.approved_count).toLocaleString("fa-IR")}
        </Link>
      </div>
      <form className="record-filters" action="/workspace/users" method="get">
        <input type="hidden" name="status" value={status} />
        <label>
          جست‌وجوی نام، شمارهٔ دانشگاهی یا ایمیل
          <input type="search" name="q" defaultValue={q} maxLength={120} />
        </label>
        <label>
          نقش
          <select name="filter" defaultValue={role}>
            <option value="all">همه</option>
            <option value="student">دانشجو</option>
            <option value="instructor">استاد</option>
          </select>
        </label>
        <button>نمایش</button>
      </form>
      {error ? (
        <p className="notice error" role="alert">
          فهرست کاربران دریافت نشد. اتصال یا دسترسی را بررسی کنید.
        </p>
      ) : !people.length ? (
        <p className="notice">
          {q || role !== "all"
            ? "کاربری با این جست‌وجو و فیلتر پیدا نشد."
            : status === "pending"
              ? "درخواستی در انتظار بررسی نیست."
              : "هنوز کاربر تأییدشده‌ای در این دامنه ثبت نشده است."}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th scope="col">کاربر</th>
                <th scope="col">نقش</th>
                <th scope="col">گروه</th>
                <th scope="col">ثبت‌نام</th>
                <th scope="col">وضعیت</th>
                <th scope="col">اقدام</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id}>
                  <th scope="row">
                    <strong>{person.display_name || "نام تکمیل نشده"}</strong>
                    <small dir="ltr">{person.email}</small>
                  </th>
                  <td>{roleName(person.requested_role)}</td>
                  <td>{person.department_name || "ثبت نشده"}</td>
                  <td>{persianDate(person.created_at)}</td>
                  <td>
                    {person.membership === "approved" && person.role_approved
                      ? "تأییدشده"
                      : "در انتظار بررسی"}
                  </td>
                  <td>
                    <Link href={`/workspace/users/${person.id}`}>
                      {status === "pending" ? "بررسی درخواست" : "مشاهدهٔ سوابق"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!error && Number(counts.total_count) > 20 && (
        <nav className="pager" aria-label="صفحه‌های کاربران">
          {page > 1 && (
            <Link href={href(status, role, q, page - 1)}>صفحهٔ قبل</Link>
          )}
          <span>صفحهٔ {page.toLocaleString("fa-IR")}</span>
          {page * 20 < Number(counts.total_count) && (
            <Link href={href(status, role, q, page + 1)}>صفحهٔ بعد</Link>
          )}
        </nav>
      )}
    </div>
  );
}
