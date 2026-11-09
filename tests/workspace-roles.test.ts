import { expect, it } from "vitest";
import {
  approvedRoles,
  roleForView,
  workspaceNavigation,
} from "../src/lib/workspace-roles";
it("keeps pending students out while allowing separately approved research staff", () => {
  const rows = [
    { role: "admin", approved: true },
    { role: "student", approved: false },
  ];
  expect(approvedRoles(rows, "pending")).toEqual(["admin"]);
  expect(approvedRoles(rows, "suspended")).toEqual([]);
  expect(approvedRoles(rows, "approved")).toEqual(["admin"]);
});
it("does not infer academic authority from technical administration", () => {
  expect(
    approvedRoles([{ role: "superadmin", approved: true }], "approved"),
  ).toEqual(["admin"]);
  expect(
    workspaceNavigation("superadmin").some(([path]) => path === "review"),
  ).toBe(false);
  expect(roleForView("administration")).toBe("admin");
  expect(roleForView("technical")).toBe("admin");
  expect(workspaceNavigation("admin").map(([path]) => path)).toEqual([
    "users",
    "report-list",
    "admin-events",
    "admin-courses",
  ]);
});
it("gives instructors a review queue rather than student submission navigation", () => {
  const links = workspaceNavigation("instructor").map(([path]) => path);
  expect(links).toContain("review");
  expect(links).not.toContain("submissions");
});
