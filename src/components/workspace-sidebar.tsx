"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { RoleSwitch } from "@/components/role-switch";
import {
  roleLabels,
  workspaceNavigation,
  type WorkspaceRole,
} from "@/lib/workspace-roles";

export function WorkspaceSidebar({
  activeRole,
  availableRoles,
  view,
  live,
}: {
  activeRole?: WorkspaceRole;
  availableRoles: WorkspaceRole[];
  view: string;
  live: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menu = workspaceNavigation(activeRole).filter(
    ([url]) => live || url === "profile",
  );
  return (
    <aside className="sidebar workspace-sidebar">
      <div className="workspace-menu-heading">
        <h2>{activeRole ? roleLabels[activeRole] : "حساب پژوهشی"}</h2>
        <button
          type="button"
          className="workspace-menu-toggle"
          aria-label={open ? "بستن فهرست" : "بخش‌های فضای کار"}
          aria-expanded={open}
          aria-controls="workspace-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
          {open ? "بستن" : "فهرست"}
        </button>
      </div>
      <div
        id="workspace-navigation"
        className={`workspace-menu-content${open ? " is-open" : ""}`}
      >
        <RoleSwitch roles={availableRoles} current={activeRole} />
        <nav aria-label="بخش‌های فضای کار">
          {menu.map(([url, title]) => (
            <Link
              href={`/workspace/${url}${activeRole ? `?role=${activeRole}` : ""}`}
              key={url}
              aria-current={view === url ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {title}
            </Link>
          ))}
        </nav>
        <ActionForm action="logout" fields={[]} button="خروج از حساب" />
      </div>
    </aside>
  );
}
