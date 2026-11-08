import { expect, it } from "vitest";
import {
  approvedRoles,
  roleForView,
  workspaceNavigation,
} from "../src/lib/workspace-roles";
it("requires both approved membership and role approval", () => {
  const rows = [
    { role: "admin", approved: true },
    { role: "student", approved: false },
  ];
  expect(approvedRoles(rows, "pending")).toEqual([]);
  expect(approvedRoles(rows, "suspended")).toEqual([]);
  expect(approvedRoles(rows, "approved")).toEqual(["admin"]);
});
it("does not infer academic authority from technical administration", () => {
  expect(
    approvedRoles([{ role: "superadmin", approved: true }], "approved"),
  ).toEqual(["superadmin"]);
  expect(
    workspaceNavigation("superadmin").some(([path]) => path === "review"),
  ).toBe(false);
  expect(roleForView("administration")).toBe("admin");
  expect(roleForView("technical")).toBe("superadmin");
});
it("gives instructors a review queue rather than student submission navigation", () => {
  const links = workspaceNavigation("instructor").map(([path]) => path);
  expect(links).toContain("review");
  expect(links).not.toContain("submissions");
});
