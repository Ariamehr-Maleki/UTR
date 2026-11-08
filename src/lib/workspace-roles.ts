export const workspaceRoles = [
  "student",
  "instructor",
  "admin",
  "superadmin",
] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];
export const roleLabels: Record<WorkspaceRole, string> = {
  student: "پنل دانشجو",
  instructor: "پنل استاد",
  admin: "پنل معاونت پژوهشی",
  superadmin: "مدیریت فنی",
};
export const roleDescriptions: Record<WorkspaceRole, string> = {
  student: "رویدادها، ارسال خلاصه و پیگیری ارزیابی",
  instructor: "درس‌های من، صف ارزیابی و بازخورد به دانشجو",
  admin: "تأیید اعضا، رویدادها، حضور و رسیدگی به پرونده‌ها",
  superadmin: "مدیریت دسترسی‌ها، تنظیمات و سابقهٔ تغییرات",
};
export const roleHome: Record<WorkspaceRole, string> = {
  student: "/workspace",
  instructor: "/workspace/instructor",
  admin: "/workspace/administration",
  superadmin: "/workspace/technical",
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
  if (membership !== "approved") return [];
  return workspaceRoles.filter((role) =>
    rows.some((row) => row.role === role && row.approved),
  );
}
export function roleForView(view: string): WorkspaceRole | undefined {
  if (["instructor", "review", "teaching"].includes(view)) return "instructor";
  if (view === "administration") return "admin";
  if (view === "technical") return "superadmin";
}
export function workspaceNavigation(role: WorkspaceRole | undefined) {
  const common = [
    ["notifications", "اعلان‌ها"],
    ["support", "پیگیری درخواست‌ها"],
    ["profile", "حساب و حریم خصوصی"],
  ];
  const entries =
    role === "instructor"
      ? [
          ["instructor", "میز استاد"],
          ["review", "صف ارزیابی"],
          ["teaching", "درس‌ها و رویدادها"],
          ["reports", "گزارش درس‌ها"],
        ]
      : role === "admin"
        ? [
            ["administration", "میز معاونت"],
            ["admin", "مدیریت پژوهشی"],
            ["reports", "گزارش عملکرد"],
          ]
        : role === "superadmin"
          ? [
              ["technical", "مدیریت فنی"],
              ["admin", "دسترسی‌ها و تنظیمات"],
              ["audit", "سابقهٔ تغییرات"],
            ]
          : role === "student"
            ? [
                ["", "میز دانشجو"],
                ["events", "رویدادها و حضور"],
                ["submissions", "خلاصه‌ها و نتایج"],
                ["courses", "درس‌های نیمسال"],
                ["engagement", "مشارکت و نشان‌ها"],
                ["certificates", "گواهی‌ها"],
              ]
            : [];
  return [...entries, ...common];
}
