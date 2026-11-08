import { AuthForm } from "@/components/auth-form";
import { accountsEnabled } from "@/lib/config";
import { notFound } from "next/navigation";
export default async function Auth({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { mode } = await params;
  const query = await searchParams;
  if (!["login", "register", "reset", "password"].includes(mode)) notFound();
  return (
    <div className="auth-shell">
      {query.error === "expired" && (
        <div className="notice error" role="alert">
          پیوند نامعتبر یا منقضی شده است. برای دریافت پیوند تازه، بازیابی رمز را
          انتخاب کنید.
        </div>
      )}
      <AuthForm
        mode={mode}
        enabled={
          accountsEnabled() &&
          (mode !== "reset" || process.env.UTR_AUTH_EMAIL_ENABLED === "true") &&
          (mode !== "register" || process.env.UTR_SIGNUP_ENABLED === "true")
        }
        unavailableMessage={
          mode === "reset"
            ? "بازیابی رمز از طریق ایمیل هنوز فعال نیست. برای راهنمایی با مسئول سامانه تماس بگیرید."
            : undefined
        }
      />
    </div>
  );
}
