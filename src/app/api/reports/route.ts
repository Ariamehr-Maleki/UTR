import { identity } from "@/lib/supabase/server";
export async function GET() {
  try {
    const { db, user } = await identity();
    const { data: roles } = await db
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("approved", true);
    if (!roles?.some((r) => ["admin", "instructor"].includes(r.role)))
      return new Response("Forbidden", { status: 403 });
    const { data, error } = await db
      .from("submissions")
      .select(
        "id,event_id,state,created_at,referrals(offering_id,instructor_id,created_at,closed_at,assessments(score,outcome,created_at))",
      );
    if (error) throw error;
    const quote = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@\-]/, "'")
        .replaceAll('"', '""') +
      '"';
    const lines = [
      [
        "submission_id",
        "event_id",
        "state",
        "offering_id",
        "score",
        "outcome",
        "response_hours",
      ]
        .map(quote)
        .join(","),
    ];
    for (const s of data || [])
      for (const r of s.referrals || [])
        for (const a of r.assessments?.length
          ? r.assessments
          : [{ score: null, outcome: "pending", created_at: null }])
          lines.push(
            [
              s.id,
              s.event_id,
              s.state,
              r.offering_id,
              a.score,
              a.outcome,
              a.created_at
                ? (new Date(a.created_at).getTime() -
                    new Date(r.created_at).getTime()) /
                  3600000
                : "",
            ]
              .map(quote)
              .join(","),
          );
    return new Response("\uFEFF" + lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="utr-report.csv"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
