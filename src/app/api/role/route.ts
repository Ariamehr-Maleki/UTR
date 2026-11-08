import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { identity } from "@/lib/supabase/server";
import {
  approvedRoles,
  isWorkspaceRole,
  roleHome,
} from "@/lib/workspace-roles";
export async function POST(req: Request) {
  if (
    !process.env.APP_ORIGIN ||
    req.headers.get("origin") !== process.env.APP_ORIGIN
  )
    return NextResponse.json(
      { message: "درخواست نامعتبر است." },
      { status: 403 },
    );
  try {
    const { role } = await req.json();
    if (!isWorkspaceRole(role))
      return NextResponse.json({ message: "نقش معتبر نیست." }, { status: 400 });
    const { db, user } = await identity("account");
    const [{ data: profile }, { data: roles }] = await Promise.all([
      db.from("profiles").select("membership").eq("id", user.id).single(),
      db.from("roles").select("role,approved").eq("user_id", user.id),
    ]);
    if (
      !approvedRoles(roles || [], profile?.membership || "pending").includes(
        role,
      )
    )
      return NextResponse.json(
        { message: "این نقش برای حساب شما تأیید نشده است." },
        { status: 403 },
      );
    (await cookies()).set("utr_workspace_role", role, {
      httpOnly: true,
      secure: process.env.APP_ORIGIN.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return NextResponse.json({ redirect: roleHome[role] });
  } catch {
    return NextResponse.json(
      { message: "برای انتخاب نقش، دوباره وارد حساب شوید." },
      { status: 401 },
    );
  }
}
