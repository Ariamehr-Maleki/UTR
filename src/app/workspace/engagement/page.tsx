import { redirect } from "next/navigation";
import { identity } from "@/lib/supabase/server";
import { liveEnabled } from "@/lib/config";
import { ActionForm } from "@/components/action-form";
export default async function Engagement({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string }>;
}) {
  if (!liveEnabled()) redirect("/workspace");
  const { db, user } = await identity();
  const { semester } = await searchParams;
  const { data: semesters } = await db
    .from("semesters")
    .select("*")
    .order("starts_on", { ascending: false });
  const selected = semester || semesters?.[0]?.id;
  const { data: points } = await db
    .from("points_ledger")
    .select("*")
    .eq("student_id", user.id);
  const total = (points || [])
    .filter((p) => p.semester_id === selected)
    .reduce((sum, p) => sum + p.points, 0);
  const { data: badges } = await db
    .from("badges")
    .select("*")
    .eq("approved", true)
    .lte("minimum_points", total);
  const ranking = selected
    ? (await db.rpc("leaderboard", { p_semester: selected })).data
    : [];
  return (
    <div className="container section">
      <h1>مشارکت و نشان‌ها</h1>
      <div className="notice">
        امتیاز مشارکت از نمره آموزشی جداست. مقدار نمره در رتبه‌بندی نقشی ندارد.
        نمایش عمومی تنها با رضایت شما در پروفایل فعال می‌شود.
      </div>
      <form className="filters">
        <label>
          نیمسال
          <select name="semester" defaultValue={selected}>
            {semesters?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <button>نمایش</button>
      </form>
      {points?.length ? (
        <p>امتیاز مشارکت این نیمسال: {total.toLocaleString("fa-IR")}</p>
      ) : (
        <div className="empty">
          پس از تصویب قواعد و ثبت فعالیت واجد شرایط، امتیاز مشارکت نمایش داده
          می‌شود.
        </div>
      )}
      <h2>نشان‌های شما</h2>
      {badges?.length ? (
        badges.map((b) => (
          <span key={b.id} className="badge">
            {b.title}
          </span>
        ))
      ) : (
        <p>هنوز نشانی ثبت نشده است.</p>
      )}
      <h2>جدول مشارکت داوطلبانه</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>رتبه مشترک</th>
              <th>نام</th>
              <th>امتیاز مشارکت</th>
            </tr>
          </thead>
          <tbody>
            {ranking?.map((r: any, i: number) => (
              <tr key={i}>
                <td>{r.rank_position}</td>
                <td>{r.display_name}</td>
                <td>{r.participation_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>گواهی عضویت</h2>
      <ActionForm
        action="certificate"
        hidden={{ kind: "membership" }}
        fields={[]}
        button="بررسی شرایط و صدور گواهی"
      />
      <h2>گواهی مشارکت</h2>
      <ActionForm
        action="certificate"
        hidden={{ kind: "participation" }}
        fields={[]}
        button="بررسی فعالیت‌های واجد شرایط"
      />
    </div>
  );
}
