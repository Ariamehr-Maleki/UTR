import { it, expect, afterEach, vi } from "vitest";
import {
  accountsEnabled,
  liveEnabled,
  publicContentEnabled,
} from "../src/lib/config";
afterEach(() => vi.unstubAllEnvs());
it("isolated integration mode accepts only the loopback stack and never a Vercel preview", () => {
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("UTR_LOCAL_INTEGRATION", "true");
  vi.stubEnv("UTR_LIVE_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  expect(liveEnabled()).toBe(true);
  vi.stubEnv("VERCEL_ENV", "preview");
  expect(liveEnabled()).toBe(false);
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://spqtwgyxzdythfmyzvyh.supabase.co",
  );
  expect(liveEnabled()).toBe(false);
});
it("account activation never activates academic operations", () => {
  vi.stubEnv("UTR_ACCOUNTS_ENABLED", "true");
  vi.stubEnv("UTR_LIVE_ENABLED", "false");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://spqtwgyxzdythfmyzvyh.supabase.co",
  );
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public");
  expect(accountsEnabled()).toBe(true);
  expect(liveEnabled()).toBe(false);
  vi.stubEnv("VERCEL_ENV", "preview");
  expect(accountsEnabled()).toBe(false);
});
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
