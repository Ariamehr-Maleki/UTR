"use client";
export function RoleSwitch({ roles }: { roles: string[] }) {
  const options = [
    { role: "student", label: "دانشجو", path: "/workspace" },
    { role: "instructor", label: "استاد", path: "/workspace/review" },
    { role: "admin", label: "اداره پژوهشی", path: "/workspace/admin" },
    { role: "superadmin", label: "مدیرکل فنی", path: "/workspace/admin" },
  ].filter((x) => roles.includes(x.role));
  if (options.length < 2) return null;
  return (
    <label>
      تغییر فضای نقش
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) location.assign(e.target.value);
        }}
      >
        <option value="">انتخاب فضای کار</option>
        {options.map((o) => (
          <option key={o.role} value={o.path}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
