"use client";
import { useState } from "react";
import Link from "next/link";
import { roleLabels, isWorkspaceRole } from "@/lib/workspace-roles";
const titles: Record<string, string> = {
  login: "ورود به حساب",
  register: "درخواست عضویت",
  reset: "بازیابی رمز عبور",
  password: "انتخاب رمز جدید",
};
export function AuthForm({
  mode,
  enabled,
  unavailableMessage,
  initialRole,
}: {
  mode: string;
  enabled: boolean;
  unavailableMessage?: string;
  initialRole?: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState(
    isWorkspaceRole(initialRole) ? initialRole : "",
  );
  return (
    <>
      <h1>{titles[mode]}</h1>
      <p>باشگاه پژوهشیاران دانشکدگان فارابی</p>
      {!enabled && (
        <div className="notice">
          {unavailableMessage ||
            "این بخش در حال آماده‌سازی است. لطفاً کمی بعد دوباره مراجعه کنید."}
        </div>
      )}
      {mode === "register" && enabled && (
        <p className="notice">
          پس از ساخت حساب، مشخصات تحصیلی خود را تکمیل کنید. استفاده از خدمات
          باشگاه پس از تأیید عضویت توسط مسئول پژوهشی امکان‌پذیر است.
        </p>
      )}
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            const res = await fetch("/api/auth", {
              method: "POST",
              body: JSON.stringify({
                mode,
                ...Object.fromEntries(new FormData(e.currentTarget)),
              }),
              headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.redirect && mode === "login" && role) {
              const selected = await fetch("/api/role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
              });
              const result = await selected.json();
              if (selected.ok && result.redirect)
                location.assign(result.redirect);
              else
                setMessage(
                  result.message ||
                    "این نقش برای حساب شما تأیید نشده است. از بخش حساب کاربری وضعیت عضویت را بررسی کنید.",
                );
            } else if (data.redirect) location.assign(data.redirect);
            else setMessage(data.message);
          } catch {
            setMessage("ارتباط برقرار نشد. دوباره تلاش کنید.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {mode === "login" && (
          <fieldset className="login-role-options">
            <legend>ورود به فضای کاری</legend>
            <label>
              <input
                type="radio"
                name="workspace_role"
                value=""
                checked={!role}
                onChange={() => setRole("")}
              />
              حساب من
            </label>
            {(["student", "instructor", "admin"] as const).map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  name="workspace_role"
                  value={item}
                  checked={role === item}
                  onChange={() => setRole(item)}
                />
                {roleLabels[item]}
              </label>
            ))}
          </fieldset>
        )}
        {mode !== "password" && (
          <label>
            ایمیل
            <input
              type="email"
              name="email"
              autoComplete="email"
              dir="ltr"
              required
              maxLength={254}
            />
          </label>
        )}
        {mode !== "reset" && (
          <label>
            رمز عبور
            <input
              type="password"
              name="password"
              required
              minLength={mode === "login" ? 1 : 12}
              maxLength={128}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              dir="ltr"
            />
          </label>
        )}
        <button disabled={!enabled || busy}>
          {busy ? "در حال انجام…" : titles[mode]}
        </button>
        <p role="status" aria-live="polite">
          {message}
        </p>
      </form>
      <div className="actions">
        <Link href="/workspace">حساب کاربری</Link>
        <Link href="/auth/login">ورود</Link>
        <Link href="/auth/register">عضویت</Link>
        <Link href="/auth/reset">فراموشی رمز</Link>
      </div>
    </>
  );
}
