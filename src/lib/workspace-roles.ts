export const workspaceRoles = ["student", "instructor", "admin"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number] | "superadmin";
export const roleLabels: Record<WorkspaceRole, string> = {
  student: "پنل دانشجو",
  instructor: "پنل استاد",
  admin: "پنل معاونت پژوهشی",
  superadmin: "پنل معاونت پژوهشی",
};
export const roleDescriptions: Record<WorkspaceRole, string> = {
  student: "رویدادها، ارسال خلاصه و پیگیری ارزیابی",
  instructor: "درس‌های من، صف ارزیابی و بازخورد به دانشجو",
  admin: "تأیید اعضا، رویدادها، حضور و رسیدگی به پرونده‌ها",
  superadmin: "کاربران، گزارش‌ها، رویدادها و امور مجاز مدیریت سامانه",
};
export const roleHome: Record<WorkspaceRole, string> = {
  student: "/workspace",
  instructor: "/workspace/review",
  admin: "/workspace/users",
  superadmin: "/workspace/users",
};
export function isWorkspaceRole(role: unknown): role is WorkspaceRole {
  return (
    typeof role === "string" &&
    (workspaceRoles as readonly string[]).includes(role)
  );
}
export function approvedRoles(
  rows: { role: string; approved: boolean }[],
  membership: string,
): WorkspaceRole[] {
  if (!["approved", "pending"].includes(membership)) return [];
  const approved = (role: string) =>
    rows.some((row) => row.role === role && row.approved);
  return [
    ...(membership === "approved" && approved("student")
      ? (["student"] as const)
      : []),
    ...(approved("instructor") ? (["instructor"] as const) : []),
    ...(approved("admin") || approved("superadmin")
      ? (["admin"] as const)
      : []),
  ];
}
export function roleForView(view: string): WorkspaceRole | undefined {
  if (["instructor", "review", "teaching"].includes(view)) return "instructor";
  if (
    [
      "administration",
      "technical",
      "admin",
      "users",
      "report-list",
      "admin-events",
      "admin-courses",
      "settings",
    ].includes(view)
  )
    return "admin";
}
export function workspaceNavigation(role: WorkspaceRole | undefined) {
  if (role === "instructor")
    return [
      ["review", "گزارش‌های دریافتی"],
      ["profile", "پروفایل من"],
    ];
  if (role === "admin" || role === "superadmin")
    return [
      ["users", "کاربران"],
      ["report-list", "گزارش‌ها"],
      ["admin-events", "رویدادها"],
      ["admin-courses", "درس‌ها و استادان"],
    ];
  return [
    ["", "رویدادها و گزارش‌های من"],
    ["profile", "پروفایل من"],
  ];
}
