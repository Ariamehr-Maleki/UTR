import { NextResponse } from "next/server";
import { database } from "@/lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next =
    url.searchParams.get("next") === "/auth/password"
      ? "/auth/password"
      : "/workspace";
  const origin = process.env.APP_ORIGIN;
  if (!origin) return new Response("Setup required", { status: 503 });
  const token = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (token && ["email", "recovery", "signup"].includes(type || "")) {
    try {
      const db = await database();
      const { error } = await db.auth.verifyOtp({
        token_hash: token,
        type: type as "email" | "recovery" | "signup",
      });
      if (!error)
        return NextResponse.redirect(
          new URL(type === "recovery" ? "/auth/password" : next, origin),
        );
    } catch {}
  }
  const code = url.searchParams.get("code");
  if (code) {
    try {
      const db = await database();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, origin));
    } catch {}
  }
  return NextResponse.redirect(new URL("/auth/login?error=expired", origin));
}
