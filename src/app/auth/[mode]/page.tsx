import { AuthForm } from "@/components/auth-form";
import { liveEnabled } from "@/lib/config";
import { notFound } from "next/navigation";
export default async function Auth({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!["login", "register", "reset", "password"].includes(mode)) notFound();
  return (
    <div className="auth-shell">
      <AuthForm
        mode={mode}
        enabled={
          liveEnabled() &&
          (mode !== "register" || process.env.UTR_SIGNUP_ENABLED === "true")
        }
      />
    </div>
  );
}
