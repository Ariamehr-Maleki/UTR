export function CreditTable({ submissions }: { submissions: any[] }) {
  const totals = new Map<
    string,
    { title: string; hundredths: number; events: number }
  >();
  for (const s of submissions) {
    if (["invalidated", "suspended", "administrative_review"].includes(s.state))
      continue;
    for (const r of s.referrals || [])
      for (const a of r.assessments || []) {
        if (a.outcome !== "score") continue;
        const row = totals.get(r.offering_id) || {
          title: r.offerings?.title || "درس",
          hundredths: 0,
          events: 0,
        };
        row.hundredths += Math.round(Number(a.score) * 100);
        row.events += 1;
        totals.set(r.offering_id, row);
      }
  }
  return totals.size ? (
    <section className="panel">
      <h2>امتیاز باشگاه به تفکیک درس</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>درس</th>
              <th>رویداد ارزیابی‌شده</th>
              <th>مجموع امتیاز باشگاه</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(totals).map(([id, t]) => (
              <tr key={id}>
                <td>{t.title}</td>
                <td>{t.events.toLocaleString("fa-IR")}</td>
                <td>
                  {(t.hundredths / 100).toLocaleString("fa-IR", {
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        سقف هر رویداد یک امتیاز است؛ سقف تجمیعی درس یا نیمسال تعیین نشده است.
        اعمال در نمره رسمی تابع مقررات آموزشی مؤسسه است.
      </p>
    </section>
  ) : null;
}
