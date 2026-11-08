import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ identity: vi.fn() }));
vi.mock("../src/lib/supabase/server", () => mocks);
vi.mock("../src/lib/config", () => ({ liveEnabled: () => false }));
import { POST } from "../src/app/api/action/route";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
it.each([
  "begin",
  "refer",
  "assess",
  "admin",
  "extend_deadline",
  "certificate",
  "adjust_points",
])(
  "account-only activation blocks %s before accessing the database",
  async (action) => {
    vi.stubEnv("APP_ORIGIN", "https://utr.example");
    const res = await POST(
      new Request("https://utr.example/api/action", {
        method: "POST",
        headers: { origin: "https://utr.example" },
        body: JSON.stringify({ action, data: {} }),
      }),
    );
    expect(res.status).toBe(503);
    expect(mocks.identity).not.toHaveBeenCalled();
  },
);
