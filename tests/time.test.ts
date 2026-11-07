import { describe, it, expect } from "vitest";
import { weekBounds, inWeek } from "../src/lib/time";
describe("Tehran weekly boundaries (candidate policy)", () => {
  it("begins Saturday midnight Tehran, not UTC midnight", () => {
    const b = weekBounds(new Date("2026-11-06T20:29:59Z"));
    expect(b.end.toISOString()).toBe("2026-11-06T20:30:00.000Z");
    expect(inWeek("2026-11-06T20:29:59Z", new Date("2026-11-01"))).toBe(true);
    expect(inWeek("2026-11-06T20:30:00Z", new Date("2026-11-01"))).toBe(false);
  });
  it("includes held events in the same week", () => {
    expect(inWeek("2026-11-01T10:00:00Z", new Date("2026-11-05"))).toBe(true);
  });
});
