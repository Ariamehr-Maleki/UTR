import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { persianDate, weekBounds } from "@/lib/time";
export async function StudentWeek({
  db,
  userId,
}: {
  db: SupabaseClient;
  userId: string;
}) {
  const now = new Date(),
    { start, end } = weekBounds(now);
  const [events, attendance] = await Promise.all([
    db
      .from("events")
      .select("id,title,starts_at,ends_at,summary_deadline,club_approved")
      .eq("status", "published")
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .order("starts_at"),
    db
      .from("attendance")
      .select("event_id")
      .eq("student_id", userId)
      .eq("confirmed", true),
  ]);
  return (
    <section className="student-week">
      <div className="desk-section-heading">
        <h2>این هفته در باشگاه</h2>
        <Link href="/workspace/events?role=student">همهٔ رویدادها و حضور</Link>
      </div>
      {events.error || attendance.error ? (
        <p role="alert">
          دریافت رویدادها انجام نشد. صفحه را دوباره بارگذاری کنید.
        </p>
      ) : events.data?.length ? (
        <div className="student-event-list">
          {events.data.map((event) => {
            const attended = attendance.data?.some(
              (row) => row.event_id === event.id,
            );
            const open =
              event.club_approved &&
              event.summary_deadline &&
              new Date(event.summary_deadline) >= now;
            return (
              <article key={event.id}>
                <div>
                  <h3>
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </h3>
                  <p>{persianDate(event.starts_at)}</p>
                  <span className="badge">
                    {attended
                      ? "حضور شما تأیید شده"
                      : new Date(event.ends_at) < now
                        ? "برگزار شده"
                        : "پیش رو"}
                  </span>
                  {open && (
                    <p>مهلت خلاصه: {persianDate(event.summary_deadline)}</p>
                  )}
                </div>
                {attended && open && (
                  <Link
                    className="button"
                    href={`/workspace/submit?event=${event.id}&role=student`}
                  >
                    ارسال خلاصه
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <strong>رویدادی برای این هفته منتشر نشده است.</strong>
          <p>
            رویدادهای مصوب پس از انتشار اینجا نمایش داده می‌شوند؛ رویداد
            برگزارشده نیز تا پایان هفته در فهرست می‌ماند.
          </p>
        </div>
      )}
    </section>
  );
}
