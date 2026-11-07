import { it, expect, afterEach, vi } from "vitest";
import { liveEnabled, publicContentEnabled } from "../src/lib/config";
afterEach(() => vi.unstubAllEnvs());
it("fails closed without explicit activation", () => {
  vi.stubEnv("UTR_LIVE_ENABLED", "false");
  expect(liveEnabled()).toBe(false);
});
it("blocks production database from previews even with activation", () => {
  vi.stubEnv("UTR_LIVE_ENABLED", "true");
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://spqtwgyxzdythfmyzvyh.supabase.co",
  );
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public");
  vi.stubEnv("UTR_PREVIEW_PROJECT_REF", "spqtwgyxzdythfmyzvyh");
  expect(liveEnabled()).toBe(false);
});

it("public content can operate without enabling accounts", () => {
  vi.stubEnv("UTR_PUBLIC_CONTENT_ENABLED", "true");
  vi.stubEnv("UTR_LIVE_ENABLED", "false");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://spqtwgyxzdythfmyzvyh.supabase.co",
  );
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public");
  expect(publicContentEnabled()).toBe(true);
  expect(liveEnabled()).toBe(false);
});
it("public-content activation cannot connect a preview to production", () => {
  vi.stubEnv("UTR_PUBLIC_CONTENT_ENABLED", "true");
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://spqtwgyxzdythfmyzvyh.supabase.co",
  );
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public");
  vi.stubEnv("UTR_PREVIEW_PROJECT_REF", "spqtwgyxzdythfmyzvyh");
  expect(publicContentEnabled()).toBe(false);
});
