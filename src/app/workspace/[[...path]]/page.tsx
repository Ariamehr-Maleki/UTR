import { RoleSwitch } from "@/components/role-switch";
import { cookies } from "next/headers";
import {
  approvedRoles,
  isWorkspaceRole,
  roleForView,
  roleHome,
  roleLabels,
  workspaceNavigation,
} from "@/lib/workspace-roles";
import { WorkspaceOverview } from "@/components/workspace-overview";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { database } from "@/lib/supabase/server";
import { accountsEnabled, liveEnabled } from "@/lib/config";
import { ActionForm } from "@/components/action-form";
import { UploadFlow } from "@/components/upload-flow";
import { Assessment } from "@/components/assessment";
import { AdminConsole } from "@/components/admin-console";
import { AdminTools } from "@/components/admin-tools";
import { CreditTable } from "@/components/credit-table";
import { persianDate } from "@/lib/time";
import { statusLabel } from "@/lib/status";
const navigation = [
  ["", "نمای کلی"],
  ["events", "رویدادها و حضور"],
  ["submissions", "خلاصه‌های من"],
  ["courses", "درس‌های نیمسال"],
  ["notifications", "اعلان‌ها"],
  ["support", "اعتراض و پشتیبانی"],
  ["engagement", "مشارکت و نشان‌ها"],
  ["certificates", "گواهی‌ها"],
  ["profile", "پروفایل"],
];
export default async function Workspace({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { path = [] } = await params;
  const view = path[0] || "";
  const query = await searchParams;
  if (!accountsEnabled())
    return (
      <div className="container section">
        <h1>فضای کار پژوهشی</h1>
        <div className="notice">
          راه‌اندازی محیط عملیاتی در حال تکمیل است. ورود به اطلاعات آموزشی پس از
          تأیید تنظیمات امنیتی فعال می‌شود.
        </div>
        <Link href="/preview/student">مشاهده نمای معرفی دانشجو</Link>
      </div>
    );
  if (!liveEnabled() && view !== "profile") redirect("/workspace/profile");
  const db = await database(liveEnabled() ? "academic" : "account");
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const { data: roles = [] } = await db
    .from("roles")
    .select("*")
    .eq("user_id", user.id)
    .eq("approved", true);
  const instructor = roles?.some((r) => r.role === "instructor");
  const admin = roles?.some((r) => r.role === "admin");
  const superadmin = roles?.some((r) => r.role === "superadmin");
  const availableRoles = approvedRoles(
    roles || [],
    profile?.membership || "pending",
  );
  const savedRole = (await cookies()).get("utr_workspace_role")?.value;
  const requestedRole = query.role || savedRole;
  const explicitRole = roleForView(view);
  if (explicitRole && !availableRoles.includes(explicitRole)) notFound();
  const activeRole =
    explicitRole ||
    (isWorkspaceRole(requestedRole) && availableRoles.includes(requestedRole)
      ? requestedRole
      : availableRoles[0]);
  if (view === "" && activeRole && activeRole !== "student")
    redirect(roleHome[activeRole]);
  const menu = workspaceNavigation(activeRole);
  let body: React.ReactNode;
  if (
    ["instructor", "administration", "technical"].includes(view) &&
    activeRole
  ) {
    body = <WorkspaceOverview db={db} userId={user.id} role={activeRole} />;
  } else if (view === "profile") {
    const { data: deps = [] } = await db.from("departments").select("*");
    body = (
      <ActionForm
        action="profile"
        fields={[
          {
            name: "display_name",
            label: "نام و نام خانوادگی",
            value: profile?.display_name,
          },
          {
            name: "student_number",
            label: "شماره دانشجویی",
            value: profile?.student_number,
            required: !(instructor || admin || superadmin),
          },
          {
            name: "degree",
            label: "مقطع",
            options: [
              { value: "bachelor", label: "کارشناسی" },
              { value: "master", label: "کارشناسی ارشد" },
              { value: "doctorate", label: "دکتری" },
            ],
            value: profile?.degree,
            required: !(instructor || admin || superadmin),
          },
          {
            name: "department_id",
            label: "گروه آموزشی",
            options: (deps || []).map((d) => ({ value: d.id, label: d.name })),
            value: profile?.department_id,
            required: !(instructor || admin || superadmin),
          },
          {
            name: "leaderboard_consent",
            label: "نمایش در جدول مشارکت عمومی",
            options: [
              { value: "false", label: "خیر" },
              { value: "true", label: "بله" },
            ],
            value: String(profile?.leaderboard_consent || false),
          },
          {
            name: "publication_consent",
            label:
              "رضایت اولیه برای بررسی انتشار خلاصه (نیازمند حذف اطلاعات شخصی)",
            options: [
              { value: "false", label: "خیر" },
              { value: "true", label: "بله" },
            ],
            value: String(profile?.publication_consent || false),
          },
        ]}
      />
    );
  } else if (view === "support") {
    const { data: appeals } = await db
      .from("appeals")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    body = (
      <>
        <ActionForm
          action="appeal"
          fields={[
            {
              name: "submission_id",
              label: "شناسه پرونده (اختیاری)",
              required: false,
              value: query.submission,
            },
            { name: "subject", label: "موضوع" },
            { name: "body", label: "شرح درخواست", type: "textarea" },
          ]}
          button="ثبت درخواست"
        />
        {appeals?.map((a) => (
          <article className="panel" key={a.id}>
            <h2>{a.subject}</h2>
            <p>{a.body}</p>
            <span className="badge">{statusLabel[a.status] || a.status}</span>
            {a.resolution && <p>{a.resolution}</p>}
          </article>
        ))}
      </>
    );
  } else if (view === "admin") {
    if (
      !activeRole ||
      !["admin", "superadmin"].includes(activeRole) ||
      !availableRoles.includes(activeRole)
    )
      notFound();
    const catalog: Record<string, any[]> = {};
    for (const table of [
      "departments",
      "profiles",
      "semesters",
      "events",
      "offerings",
      "forms",
      "policies",
      "content",
      "appeals",
      "submissions",
    ]) {
      const { data } = await db.from(table).select("*");
      catalog[table] = data || [];
    }
    body = (
      <>
        <AdminConsole
          key={`${activeRole}:${query.operation || ""}`}
          superadmin={!!superadmin && activeRole === "superadmin"}
          academic={!!admin && activeRole === "admin"}
          catalog={catalog}
          initialOperation={query.operation}
        />
        <AdminTools
          technical={!!superadmin && activeRole === "superadmin"}
          academic={!!admin && activeRole === "admin"}
          catalog={catalog}
        />
      </>
    );
  } else if (view === "teaching") {
    if (!instructor) notFound();
    const { data: offerings } = await db
      .from("offerings")
      .select("*,semesters(title),event_offerings(events(id,title))")
      .eq("instructor_id", user.id)
      .eq("approved", true);
    body = (
      <>
        {offerings?.length ? (
          offerings.map((o) => (
            <article key={o.id} className="panel">
              <h2>{o.title}</h2>
              <p>{o.semesters?.title}</p>
              <h3>رویدادهای مرتبط</h3>
              {o.event_offerings?.map((r: any) => (
                <p key={r.events?.id}>
                  <Link href={`/events/${r.events?.id}`}>
                    {r.events?.title}
                  </Link>
                </p>
              ))}
            </article>
          ))
        ) : (
          <Empty text="هنوز درس تأییدشده‌ای برای شما ثبت نشده است." />
        )}
        <Link href="/workspace/reports">گزارش درس‌ها و دریافت خروجی</Link>
      </>
    );
  } else if (view === "review") {
    if (!instructor) notFound();
    const history = query.queue === "history";
    const { data: refs, error: reviewError } = await db
      .from("referrals")
      .select(
        "*,offerings(title),submissions(event_id,state),attachments(version,mime)",
      )
      .eq("instructor_id", user.id)
      .eq("active", !history)
      .order("created_at", { ascending: true });
    await Promise.all(
      (refs || []).map(async (r) => {
        const { data } = await db.rpc("referral_context", { p_referral: r.id });
        (r as any).context = data;
      }),
    );
    const visible = (refs || []).filter(
      (r: any) =>
        query.queue !== "overdue" ||
        (r.context?.review_hours &&
          new Date(r.created_at).getTime() +
            Number(r.context.review_hours) * 3600000 <
            Date.now()),
    );
    body = (
      <>
        <nav className="queue-tabs" aria-label="صف‌های ارزیابی">
          {[
            ["active", "در انتظار ارزیابی"],
            ["overdue", "گذشته از زمان پاسخ"],
            ["history", "سابقهٔ ارزیابی"],
          ].map(([queue, title]) => (
            <Link
              key={queue}
              href={`/workspace/review?queue=${queue}&role=instructor`}
              aria-current={
                (query.queue || "active") === queue ? "page" : undefined
              }
            >
              {title}
            </Link>
          ))}
        </nav>
        {reviewError ? (
          <div className="notice error" role="alert">
            دریافت صف ارزیابی انجام نشد. صفحه را دوباره بارگذاری کنید.
          </div>
        ) : visible.length ? (
          visible.map((r) => (
            <Assessment key={r.id} referral={r} readOnly={history} />
          ))
        ) : (
          <Empty
            text={
              history
                ? "هنوز ارجاع بسته‌شده‌ای ندارید."
                : query.queue === "overdue"
                  ? "پرونده‌ای با زمان پاسخ مصوبِ گذشته وجود ندارد."
                  : "خلاصه جدیدی برای ارزیابی ندارید."
            }
          />
        )}
      </>
    );
  } else if (view === "submit") {
    const { data: events = [] } = await db
      .from("events")
      .select("*")
      .eq("status", "published")
      .eq("club_approved", true);
    const { data: attendance = [] } = await db
      .from("attendance")
      .select("*")
      .eq("student_id", user.id)
      .eq("confirmed", true);
    const { data: enroll = [] } = await db.rpc("student_offerings");
    let resume;
    if (query.submission) {
      const { data } = await db
        .from("submissions")
        .select("*,attachments(*),referrals(*)")
        .eq("id", query.submission)
        .eq("student_id", user.id)
        .single();
      resume = data;
    }
    const { data: relevance = [] } = await db
      .from("event_offerings")
      .select("*");
    body = (
      <UploadFlow
        events={(events || []).filter((e) =>
          attendance?.some((a) => a.event_id === e.id),
        )}
        enrollments={(enroll || []).map((e: any) => ({
          ...e,
          offerings: { title: e.title },
        }))}
        relevance={relevance || []}
        resume={resume}
      />
    );
  } else if (view === "events") {
    const { data: events } = await db
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("starts_at");
    const { data: attendance } = await db
      .from("attendance")
      .select("*")
      .eq("student_id", user.id);
    const { data: registrations } = await db
      .from("registrations")
      .select("*")
      .eq("student_id", user.id);
    body = events?.length ? (
      events.map((e) => (
        <article className="panel" key={e.id}>
          <h2>{e.title}</h2>
          <p>{persianDate(e.starts_at)}</p>
          <p>
            حضور:{" "}
            {attendance?.find((a) => a.event_id === e.id)?.confirmed
              ? "تأییدشده"
              : "تأیید نشده"}
          </p>
          {registrations?.some(
            (r) => r.event_id === e.id && r.status === "registered",
          ) ? (
            <>
              <p>ثبت‌نام شما انجام شده است؛ حضور باید جداگانه تأیید شود.</p>
              <ActionForm
                action="cancel_registration"
                hidden={{ event_id: e.id }}
                fields={[]}
                button="لغو ثبت‌نام"
              />
            </>
          ) : (
            <ActionForm
              action="register"
              hidden={{ event_id: e.id }}
              fields={[]}
              button="ثبت‌نام در رویداد"
            />
          )}
          {attendance?.some((a) => a.event_id === e.id && a.confirmed) && (
            <>
              <ActionForm
                action="sync_points"
                hidden={{ event_id: e.id }}
                fields={[]}
                button="بررسی امتیاز مشارکت طبق قواعد مصوب"
              />
              <ActionForm
                action="certificate"
                hidden={{ event_id: e.id, kind: "attendance" }}
                fields={[]}
                button="بررسی شرایط گواهی حضور"
              />
            </>
          )}
        </article>
      ))
    ) : (
      <Empty text="هنوز رویدادی منتشر نشده است." />
    );
  } else if (view === "submissions" || view === "") {
    const { data: subs } = await db
      .from("submissions")
      .select("*,events(title),referrals(*,offerings(title),assessments(*))")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    body = (
      <>
        <div className="panel">
          <h2>گام بعدی شما</h2>
          <p>
            {profile?.membership === "approved"
              ? "برای رویدادی که در آن حضور داشته‌اید، خلاصه خود را ارسال کنید."
              : "پروفایل دانشگاهی خود را تکمیل کنید و منتظر بررسی عضویت بمانید."}
          </p>
          <Link
            className="button"
            href={
              profile?.membership === "approved"
                ? "/workspace/submit"
                : "/workspace/profile"
            }
          >
            {profile?.membership === "approved"
              ? "ارسال خلاصه"
              : "تکمیل پروفایل"}
          </Link>
        </div>
        <CreditTable submissions={subs || []} />
        <h2>پرونده‌های پژوهشی</h2>
        {subs?.length ? (
          subs.map((s) => (
            <article className="panel" key={s.id}>
              <h3>{s.events?.title}</h3>
              <span className="badge">{statusLabel[s.state] || s.state}</span>
              <p>
                شناسه پیگیری: <bdi>{s.id}</bdi>
              </p>
              <p>مهلت اولیه: {persianDate(s.deadline_snapshot)}</p>
              {s.referrals?.map((r: any) => (
                <div key={r.id}>
                  <strong>{r.offerings?.title}</strong>
                  {r.assessments?.map((a: any) => (
                    <p key={a.id}>
                      {a.feedback}{" "}
                      {a.score !== null && (
                        <>
                          {" "}
                          — امتیاز: <bdi>{a.score}</bdi>
                        </>
                      )}
                    </p>
                  ))}
                </div>
              ))}
              {s.positive_locked && (
                <p>ارجاع مجدد به دلیل ثبت امتیاز مثبت قفل است.</p>
              )}
              {["draft", "revision_requested", "zero", "wrong_course"].includes(
                s.state,
              ) &&
                !s.positive_locked && (
                  <p>
                    <Link
                      className="button"
                      href={`/workspace/submit?submission=${s.id}`}
                    >
                      ادامه ارسال یا ارجاع مجاز
                    </Link>
                  </p>
                )}
              <Link href={`/workspace/support?submission=${s.id}`}>
                درخواست بررسی اداری
              </Link>
            </article>
          ))
        ) : (
          <Empty text="هنوز خلاصه‌ای ثبت نکرده‌اید." />
        )}
      </>
    );
  } else if (view === "courses") {
    const { data: rows } = await db
      .from("enrollments")
      .select("*,offerings(title,semester_id)")
      .eq("student_id", user.id);
    body = rows?.length ? (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>درس</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.offering_id}>
                <td>{r.offerings?.title}</td>
                <td>{r.approved ? "تأییدشده" : "در انتظار تأیید"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <Empty text="درس‌های شما پس از تأیید اداره پژوهشی نمایش داده می‌شوند." />
    );
  } else if (view === "notifications") {
    const { data: rows } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    body = rows?.length ? (
      rows.map((n) => (
        <article className="panel" key={n.id}>
          <h2>{n.title}</h2>
          <p>{n.body}</p>
          {!n.read_at && (
            <ActionForm
              action="read_notification"
              hidden={{ id: n.id }}
              fields={[]}
              button="خواندم"
            />
          )}
        </article>
      ))
    ) : (
      <Empty text="اعلان تازه‌ای ندارید." />
    );
  } else if (view === "certificates") {
    const { data: rows } = await db
      .from("certificates")
      .select("*")
      .eq("student_id", user.id);
    body = rows?.length ? (
      rows.map((c) => (
        <article className="panel" key={c.id}>
          <h2>{c.kind}</h2>
          <p>{c.revoked_at ? "باطل‌شده" : "صادرشده"}</p>
          <Link href={`/workspace/certificate/${c.id}`}>
            مشاهده و چاپ گواهی
          </Link>
        </article>
      ))
    ) : (
      <Empty text="گواهی پس از تصویب شرایط و احراز صلاحیت صادر می‌شود." />
    );
  } else notFound();
  return (
    <div className="container workspace workspace-v2">
      <aside className="sidebar">
        <h2>{activeRole ? roleLabels[activeRole] : "حساب پژوهشی"}</h2>
        <RoleSwitch roles={availableRoles} current={activeRole} />
        {menu
          .filter(([url]) => liveEnabled() || url === "profile")
          .map(([url, title]) => (
            <Link
              href={`/workspace/${url}${activeRole ? `?role=${activeRole}` : ""}`}
              key={url}
              aria-current={view === url ? "page" : undefined}
            >
              {title}
            </Link>
          ))}
        <ActionForm action="logout" fields={[]} button="خروج" />
      </aside>
      <section>
        <h1>
          {menu.find((x) => x[0] === view)?.[1] ||
            navigation.find((x) => x[0] === view)?.[1] ||
            (
              {
                submit: "ارسال خلاصه",
                review: "میز ارزیابی",
                admin: "مدیریت",
                teaching: "درس‌ها و رویدادهای استاد",
              } as Record<string, string>
            )[view]}
        </h1>
        {profile?.membership !== "approved" && (
          <div className="notice">
            وضعیت عضویت:{" "}
            {statusLabel[profile?.membership] || profile?.membership}. تأیید
            ایمیل به‌تنهایی تأیید وضعیت دانشجویی نیست.
          </div>
        )}
        {body}
        <p className="muted">
          شناسه حساب شما: <bdi dir="ltr">{user.id}</bdi>
        </p>
      </section>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <strong>{text}</strong>
      <p>اطلاعات جدید پس از ثبت و تأیید در این بخش نمایش داده می‌شود.</p>
    </div>
  );
}
