import { afterEach, beforeEach, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("../src/lib/supabase/server", () => ({
  database: async () => ({ auth }),
}));
vi.mock("../src/lib/config", () => ({ liveEnabled: () => true }));
import { POST } from "../src/app/api/auth/route";
const origin = "https://utr.example";
function request(mode: string, suppliedOrigin = origin) {
  return new Request(`${origin}/api/auth`, {
    method: "POST",
    headers: { origin: suppliedOrigin, "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      email: "student@example.com",
      password: "long-test-password",
    }),
  });
}
beforeEach(() => {
  vi.stubEnv("APP_ORIGIN", origin);
  vi.stubEnv("UTR_SIGNUP_ENABLED", "true");
  vi.stubEnv("UTR_AUTH_EMAIL_ENABLED", "false");
});
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});
it("takes an immediately authenticated new account to profile completion", async () => {
  auth.signUp.mockResolvedValue({
    data: { session: { access_token: "test" } },
    error: null,
  });
  const res = await POST(request("register"));
  expect(await res.json()).toEqual({ redirect: "/workspace/profile" });
  expect(auth.signUp.mock.calls[0][0]).not.toHaveProperty("role");
});
it("does not claim an active session when email confirmation is required", async () => {
  auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
  expect(await (await POST(request("register"))).json()).not.toHaveProperty(
    "redirect",
  );
});
it("keeps disabled recovery independent of signup", async () => {
  expect((await POST(request("reset"))).status).toBe(503);
  expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
});
it("blocks cross-origin authentication changes", async () => {
  expect(
    (await POST(request("register", "https://other.example"))).status,
  ).toBe(403);
  expect(auth.signUp).not.toHaveBeenCalled();
});
it("does not redirect failed registration into the workspace", async () => {
  auth.signUp.mockResolvedValue({
    data: { session: null },
    error: { message: "failure" },
  });
  expect((await POST(request("register"))).status).toBe(400);
});
it("requires verified server identity before password changes", async () => {
  auth.getUser.mockResolvedValue({ data: { user: null } });
  expect((await POST(request("password"))).status).toBe(400);
  expect(auth.updateUser).not.toHaveBeenCalled();
});
