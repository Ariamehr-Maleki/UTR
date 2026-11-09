"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserApproval({
  id,
  role,
  enabled,
  missing = [],
  compact = false,
}: {
  id: string;
  role: "student" | "instructor";
  enabled: boolean;
  missing?: string[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (missing.length)
    return (
      <span className="review-gap">نیازمند تکمیل: {missing.join("، ")}</span>
    );
  if (!enabled)
    return <span className="review-gap">تأیید نیازمند اختیار پژوهشی است.</span>;
  return (
    <details
      className={compact ? "approval-control compact" : "approval-control"}
    >
      <summary>{role === "instructor" ? "تأیید استاد" : "تأیید عضویت"}</summary>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const reason =
            new FormData(form).get("reason")?.toString().trim() || "";
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/action", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "review_user",
                data: { user_id: id, role, reason },
              }),
            });
            const result = await response.json();
            setMessage(
              result.message ||
                (response.ok ? "تصمیم ثبت شد." : "تأیید انجام نشد."),
            );
            if (response.ok) router.refresh();
          } catch {
            setMessage("اتصال برقرار نشد؛ دوباره تلاش کنید.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p>پس از تطبیق مشخصات با مرجع دانشگاهی، دلیل تصمیم را بنویسید.</p>
        <label>
          دلیل تأیید
          <textarea name="reason" minLength={5} maxLength={2000} required />
        </label>
        <button disabled={busy}>{busy ? "در حال ثبت…" : "ثبت تأیید"}</button>
        <p role="status">{message}</p>
      </form>
    </details>
  );
}
