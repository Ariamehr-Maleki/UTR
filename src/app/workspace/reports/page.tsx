import { redirect, notFound } from "next/navigation";
import { identity } from "@/lib/supabase/server";
import { liveEnabled } from "@/lib/config";
import { statusLabel } from "@/lib/status";
export default async function Reports() {
  if (!liveEnabled()) redirect("/workspace");
  const { db, user } = await identity();
  const { data: roles } = await db
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("approved", true);
  if (!roles?.some((r) => ["admin", "instructor"].includes(r.role))) notFound();
  const admin = roles.some((r) => r.role === "admin");
  const { data: subs } = await db
    .from("submissions")
    .select(
      "*,events(title,department_id),referrals(*,offerings(title),assessments(*))",
    );
  const rows = (subs || []).filter(
    (s) => admin || s.referrals?.some((r: any) => r.instructor_id === user.id),
  );
  const { data: attendance } = await db
    .from("attendance")
    .select("event_id,student_id")
    .eq("confirmed", true);
  const { data: profiles } = admin
    ? await db.from("profiles").select("id,department_id")
    : { data: [] };
  const { data: departments } = await db.from("departments").select("id,name");
  const groups = (departments || [])
    .map((d) => ({
      name: d.name,
      participants: new Set(
        rows
          .filter((s) =>
            profiles?.some(
              (p) => p.id === s.student_id && p.department_id === d.id,
            ),
          )
          .map((s) => s.student_id),
      ).size,
    }))
    .filter((d) => d.participants > 0);
  return (
    <div className="container section">
      <h1>گزارش عملیاتی پژوهشی</h1>
      <p>
        این گزارش خصوصی و محدود به دامنه دسترسی شماست. امتیاز باشگاه به معنای
        ثبت نمره رسمی دانشگاه نیست.
      </p>
      <a className="button" href="/api/reports">
        دریافت CSV
      </a>
      <dl className="panel">
        <dt>خلاصه‌های قابل دسترسی</dt>
        <dd>{rows.length.toLocaleString("fa-IR")}</dd>
        <dt>پرونده‌های تکمیل یا ارزیابی‌شده</dt>
        <dd>
          {rows
            .filter((s) => ["positive", "zero", "completed"].includes(s.state))
            .length.toLocaleString("fa-IR")}
        </dd>
        <dt>در انتظار ارزیابی</dt>
        <dd>
          {rows
            .filter((s) => ["submitted", "under_review"].includes(s.state))
            .length.toLocaleString("fa-IR")}
        </dd>
        <dt>بررسی اداری یا استثنا</dt>
        <dd>
          {rows
            .filter((s) =>
              ["administrative_review", "suspended", "invalidated"].includes(
                s.state,
              ),
            )
            .length.toLocaleString("fa-IR")}
        </dd>
        {admin && (
          <>
            <dt>حضورهای تأییدشده در دامنه شما</dt>
            <dd>{attendance?.length.toLocaleString("fa-IR")}</dd>
          </>
        )}
      </dl>
      {admin && (
        <section className="section">
          <h2>مشارکت بر اساس گروه دانشجو</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>گروه</th>
                  <th>دانشجویان دارای پرونده</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.name}>
                    <td>{g.name}</td>
                    <td>{g.participants.toLocaleString("fa-IR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>رویداد</th>
              <th>درس</th>
              <th>وضعیت</th>
              <th>امتیاز باشگاه</th>
              <th>زمان پاسخ؛ ساعت</th>
            </tr>
          </thead>
          <tbody>
            {rows.flatMap((s) =>
              (s.referrals?.length ? s.referrals : [null]).map((r: any) => (
                <tr key={r?.id || s.id}>
                  <td>{s.events?.title}</td>
                  <td>{r?.offerings?.title || "هنوز ارجاع نشده"}</td>
                  <td>{statusLabel[s.state]}</td>
                  <td>
                    {r?.assessments
                      ?.filter((a: any) => a.outcome === "score")
                      .map((a: any) => a.score)
                      .join("، ") || "—"}
                  </td>
                  <td>
                    {r?.closed_at
                      ? (
                          (new Date(r.closed_at).getTime() -
                            new Date(r.created_at).getTime()) /
                          3600000
                        ).toLocaleString("fa-IR", { maximumFractionDigits: 1 })
                      : "در انتظار پاسخ"}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
