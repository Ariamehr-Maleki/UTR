import { NextResponse } from "next/server";
import { z } from "zod";
import { identity } from "@/lib/supabase/server";
import { liveEnabled } from "@/lib/config";
const uuid = z.uuid();
export async function POST(req: Request) {
  if (req.headers.get("origin") !== process.env.APP_ORIGIN)
    return NextResponse.json(
      { message: "درخواست نامعتبر است." },
      { status: 403 },
    );
  try {
    const { action, data: d } = z
      .object({ action: z.string(), data: z.record(z.string(), z.string()) })
      .parse(await req.json());
    const accountAction = ["profile", "logout"].includes(action);
    if (!accountAction && !liveEnabled())
      return NextResponse.json(
        { message: "خدمات پژوهشی هنوز فعال نشده است." },
        { status: 503 },
      );
    const { db } = await identity(accountAction ? "account" : "academic");
    let result;
    switch (action) {
      case "profile":
        result = await db.rpc("update_profile", {
          p_name: z.string().min(2).max(150).parse(d.display_name),
          p_number: d.student_number || null,
          p_degree: d.degree || null,
          p_department: d.department_id ? uuid.parse(d.department_id) : null,
          p_leaderboard: d.leaderboard_consent === "true",
          p_publication: d.publication_consent === "true",
        });
        break;
      case "extend_deadline":
        result = await db.rpc("extend_submission_deadline", {
          p_submission: uuid.parse(d.submission_id),
          p_deadline: d.deadline + "+03:30",
          p_reason: d.reason,
        });
        break;
      case "maintenance":
        result = await db.rpc("set_maintenance", {
          p_enabled: d.enabled === "true",
          p_reason: d.reason,
        });
        break;
      case "notify":
        result = await db.rpc("notify_user", {
          p_user: uuid.parse(d.user_id),
          p_title: d.title,
          p_body: d.body,
          p_reason: d.reason,
        });
        break;
      case "revoke_certificate":
        result = await db.rpc("revoke_certificate", {
          p_id: uuid.parse(d.id),
          p_reason: d.reason,
        });
        break;
      case "issue_certificate_for":
        if (d.kind === "attendance" && !d.event_id)
          return NextResponse.json(
            {
              message: "برای گواهی حضور، رویدادی با حضور تأییدشده انتخاب کنید.",
            },
            { status: 400 },
          );
        if (d.kind !== "attendance" && d.event_id)
          return NextResponse.json(
            { message: "رویداد فقط برای گواهی حضور انتخاب می‌شود." },
            { status: 400 },
          );
        result = await db.rpc("issue_certificate_for", {
          p_student: uuid.parse(d.student_id),
          p_kind: z
            .enum(["membership", "attendance", "participation"])
            .parse(d.kind),
          p_event: d.event_id ? uuid.parse(d.event_id) : null,
          p_reason: z.string().min(5).max(2000).parse(d.reason),
        });
        break;
      case "cancel_registration":
        result = await db.rpc("cancel_registration", {
          p_event: uuid.parse(d.event_id),
        });
        break;
      case "week_policy":
        result = await db.rpc("set_week_policy", {
          p_policy: uuid.parse(d.policy_id),
          p_start: Number(d.week_start),
          p_cutoff: d.cutoff,
          p_reason: d.reason,
        });
        break;
      case "register":
        result = await db.rpc("register_event", {
          p_event: uuid.parse(d.event_id),
        });
        break;
      case "review_user":
        result = await db.rpc("review_user", {
          p_user: uuid.parse(d.user_id),
          p_role: z.enum(["student", "instructor"]).parse(d.role),
          p_reason: z.string().min(5).max(2000).parse(d.reason),
        });
        break;
      case "begin":
        result = await db.rpc("begin_submission", {
          p_event: uuid.parse(d.event_id),
        });
        break;
      case "refer":
        result = await db.rpc("submit_referral", {
          p_submission: uuid.parse(d.submission_id),
          p_offering: uuid.parse(d.offering_id),
          p_attachment: uuid.parse(d.attachment_id),
        });
        break;
      case "assess": {
        const outcome = z
          .enum(["score", "revision", "wrong_course", "administrative_review"])
          .parse(d.outcome);
        const score =
          outcome === "score"
            ? z
                .string()
                .regex(/^(0(\.\d{1,2})?|1(\.0{1,2})?)$/)
                .parse(d.score)
            : null;
        if (score !== null && Number(score) > 0 && d.confirm !== "true")
          throw Error("confirmation required");
        result = await db.rpc("assess", {
          p_referral: uuid.parse(d.referral_id),
          p_attachment: uuid.parse(d.attachment_id),
          p_outcome: outcome,
          p_score: score,
          p_feedback: z.string().min(1).max(10000).parse(d.feedback),
          p_request: uuid.parse(d.request_id),
        });
        break;
      }
      case "appeal":
        result = await db.rpc("open_appeal", {
          p_submission: d.submission_id ? uuid.parse(d.submission_id) : null,
          p_subject: z.string().min(3).max(200).parse(d.subject),
          p_body: z.string().min(10).max(10000).parse(d.body),
        });
        break;
      case "read_notification":
        result = await db.rpc("read_notification", { p_id: uuid.parse(d.id) });
        break;
      case "admin": {
        const payload = JSON.parse(d.payload);
        if (d.operation === "content") {
          payload.editorial = {};
          for (const key of [
            "year",
            "date",
            "time",
            "speaker",
            "venue",
            "topic",
            "image",
            "source",
            "email",
            "phone",
            "order",
          ]) {
            if (payload[key] !== undefined && payload[key] !== "")
              payload.editorial[key] =
                key === "order"
                  ? z.coerce
                      .number()
                      .int()
                      .min(0)
                      .max(10000)
                      .parse(payload[key])
                  : z.string().max(1000).parse(payload[key]);
            delete payload[key];
          }
          if (payload.editorial.source)
            z.string()
              .url()
              .startsWith("https://")
              .parse(payload.editorial.source);
          if (payload.editorial.email)
            z.string().email().parse(payload.editorial.email);
        }
        result = await db.rpc("admin_action", {
          p_action: d.operation,
          p_data: payload,
          p_reason: z.string().min(5).max(2000).parse(d.reason),
        });
        break;
      }
      case "logout":
        await db.auth.signOut();
        return NextResponse.json({ redirect: "/" });
      default:
        throw Error("invalid action");
    }
    if (result.error)
      return NextResponse.json(
        {
          message:
            action === "issue_certificate_for"
              ? "گواهی صادر نشد. عضویت دانشجو، دامنهٔ اختیار معاونت و برای گواهی حضور، ثبت حضور تأییدشده را بررسی کنید."
              : "ثبت انجام نشد: دسترسی، مهلت یا وضعیت پرونده را بررسی کنید. اگر مشکل ادامه داشت، درخواست پشتیبانی ثبت کنید.",
        },
        { status: 409 },
      );
    return NextResponse.json({ message: "با موفقیت ثبت شد.", id: result.data });
  } catch {
    return NextResponse.json(
      {
        message:
          "اطلاعات یا مجوز درخواست معتبر نیست. لطفاً ورود و مقادیر فرم را بررسی کنید.",
      },
      { status: 400 },
    );
  }
}
