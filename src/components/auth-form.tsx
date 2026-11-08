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
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(
    isWorkspaceRole(initialRole) ? initialRole : "",
  );
  return (
    <>
      <h1>{titles[mode]}</h1>
      <p>پلتفرم پژوهش و فناوری دانشکدگان فارابی</p>
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
      {mode === "reset" && !enabled && (
        <p className="notice">
          بازیابی رمز از راه ایمیل هنوز فعال نیست. برای بازگرداندن دسترسی، از
          صفحهٔ <Link href="/about">ارتباط با معاونت پژوهشی</Link> پیگیری کنید.
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
            <legend>فضای کاری شما</legend>
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
            <p className="role-help">
              اگر چند نقش تأییدشده دارید، فضای کاری را انتخاب کنید. این انتخاب
              مجوز تازه‌ای ایجاد نمی‌کند؛ پس از ورود هم می‌توانید نقش را عوض
              کنید. اگر نقشی ندارید، پروفایل خود را تکمیل کنید.
            </p>
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
              type={showPassword ? "text" : "password"}
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
        {mode !== "reset" && (
          <button
            type="button"
            className="password-visibility"
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
          </button>
        )}
        <button disabled={!enabled || busy}>
          {busy ? "در حال انجام…" : titles[mode]}
        </button>
        <p role="status" aria-live="polite">
          {message}
        </p>
      </form>
      <div className="actions">
        {mode !== "login" && <Link href="/auth/login">ورود</Link>}
        {mode !== "register" && <Link href="/auth/register">عضویت</Link>}
        {mode !== "reset" && <Link href="/auth/reset">فراموشی رمز</Link>}
      </div>
    </>
  );
}
