import { notFound, redirect } from "next/navigation";
import { identity } from "@/lib/supabase/server";
import { liveEnabled } from "@/lib/config";
import { persianDate } from "@/lib/time";
export default async function Audit() {
  if (!liveEnabled()) redirect("/workspace");
  const { db } = await identity();
  const { data: allowed } = await db.rpc("has_role", { wanted: "superadmin" });
  if (!allowed) notFound();
  const { data: rows } = await db
    .from("audit")
    .select("id,actor_id,action,entity,entity_id,reason,created_at")
    .order("id", { ascending: false })
    .limit(100);
  return (
    <div className="container section">
      <h1>ممیزی امنیت و تغییرات</h1>
      <p>
        ۱۰۰ تغییر اخیر؛ جزئیات خصوصی پرونده‌ها در این فهرست نمایش داده نمی‌شود.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>زمان</th>
              <th>عامل</th>
              <th>عملیات</th>
              <th>موضوع</th>
              <th>دلیل</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id}>
                <td>{persianDate(r.created_at)}</td>
                <td>
                  <bdi>{r.actor_id || "عملیات امن سامانه"}</bdi>
                </td>
                <td>{r.action}</td>
                <td>
                  {r.entity}
                  <br />
                  <bdi>{r.entity_id}</bdi>
                </td>
                <td>{r.reason || "رویداد عادی گردش کار"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
