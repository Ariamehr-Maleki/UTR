import { NextResponse } from "next/server";
import { z } from "zod";
import { database } from "@/lib/supabase/server";
import { accountsEnabled } from "@/lib/config";
export async function POST(req: Request) {
  if (!accountsEnabled())
    return NextResponse.json(
      { message: "سامانه عملیاتی فعال نیست." },
      { status: 503 },
    );
  const origin = process.env.APP_ORIGIN;
  if (!origin || req.headers.get("origin") !== origin)
    return NextResponse.json(
      { message: "درخواست نامعتبر است." },
      { status: 403 },
    );
  try {
    const body = z
      .object({
        mode: z.enum(["login", "register", "reset", "password", "logout"]),
        email: z.email().optional(),
        password: z.string().min(1).max(128).optional(),
      })
      .parse(await req.json());
    if (["register", "password"].includes(body.mode))
      z.string().min(12).parse(body.password);
    if (["login", "register", "reset"].includes(body.mode))
      z.email().parse(body.email);
    const db = await database("account");
    let error;
    if (body.mode === "logout") {
      ({ error } = await db.auth.signOut());
    } else if (body.mode === "login") {
      ({ error } = await db.auth.signInWithPassword({
        email: body.email!,
        password: body.password!,
      }));
    } else if (body.mode === "register") {
      if (process.env.UTR_SIGNUP_ENABLED !== "true")
        return NextResponse.json(
          { message: "عضویت هنوز فعال نیست." },
          { status: 403 },
        );
      const result = await db.auth.signUp({
        email: body.email!,
        password: body.password!,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      error = result.error;
      if (!error && result.data.session)
        return NextResponse.json({ redirect: "/workspace/profile" });
    } else if (body.mode === "reset") {
      if (process.env.UTR_AUTH_EMAIL_ENABLED !== "true")
        return NextResponse.json(
          {
            message:
              "بازیابی رمز از طریق ایمیل هنوز فعال نیست. برای راهنمایی با مسئول سامانه تماس بگیرید.",
          },
          { status: 503 },
        );
      await db.auth.resetPasswordForEmail(body.email!, {
        redirectTo: `${origin}/auth/callback?next=/auth/password`,
      });
    } else {
      const { data } = await db.auth.getUser();
      if (!data.user) throw Error();
      ({ error } = await db.auth.updateUser({ password: body.password! }));
    }
    if (error)
      return NextResponse.json(
        {
          message:
            body.mode === "login"
              ? "ورود انجام نشد. ایمیل و رمز عبور را بررسی کنید. اگر رمز را فراموش کرده‌اید، از بخش ارتباط با معاونت پژوهشی راهنمایی بگیرید."
              : "درخواست انجام نشد. اطلاعات را بررسی کنید یا کمی بعد تلاش کنید.",
        },
        { status: 400 },
      );
    return NextResponse.json(
      ["login", "logout", "password"].includes(body.mode)
        ? { redirect: body.mode === "logout" ? "/" : "/workspace" }
        : {
            message:
              "اگر درخواست معتبر باشد، راهنمای ادامه به ایمیل شما ارسال می‌شود.",
          },
    );
  } catch {
    return NextResponse.json(
      { message: "اطلاعات واردشده معتبر نیست." },
      { status: 400 },
    );
  }
}
