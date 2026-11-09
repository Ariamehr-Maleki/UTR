"use client";
import { useState } from "react";
export function RoleSwitch({
  roles,
  current,
}: {
  roles: string[];
  current?: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const options = [
    { role: "student", label: "دانشجو", path: "/workspace" },
    { role: "instructor", label: "استاد", path: "/workspace/review" },
    {
      role: "admin",
      label: "معاونت پژوهشی",
      path: "/workspace/users",
    },
  ].filter((x) => roles.includes(x.role));
  if (options.length < 2) return null;
  return (
    <label>
      تغییر فضای نقش
      <select
        value={current || ""}
        disabled={busy}
        onChange={async (e) => {
          if (!e.target.value) return;
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/role", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: e.target.value }),
            });
            const result = await response.json();
            if (response.ok && result.redirect)
              location.assign(result.redirect);
            else setMessage(result.message);
          } catch {
            setMessage("ارتباط برقرار نشد. دوباره تلاش کنید.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <option value="">انتخاب فضای کار</option>
        {options.map((o) => (
          <option key={o.role} value={o.role}>
            {o.label}
          </option>
        ))}
      </select>
      <span role="status">{busy ? "در حال تغییر فضای کاری…" : message}</span>
    </label>
  );
}
