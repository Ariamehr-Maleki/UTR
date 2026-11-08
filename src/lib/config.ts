function configuredEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return false;
  if (!process.env.VERCEL_ENV && process.env.UTR_LOCAL_INTEGRATION === "true") {
    return url === "http://127.0.0.1:54321";
  }
  if (process.env.VERCEL_ENV !== "production") {
    const ref = process.env.UTR_PREVIEW_PROJECT_REF;
    return (
      !!ref &&
      ref !== "spqtwgyxzdythfmyzvyh" &&
      url === `https://${ref}.supabase.co`
    );
  }
  return true;
}
export function liveEnabled() {
  return process.env.UTR_LIVE_ENABLED === "true" && configuredEnvironment();
}
export function accountsEnabled() {
  return (
    (process.env.UTR_ACCOUNTS_ENABLED === "true" || liveEnabled()) &&
    configuredEnvironment()
  );
}
export function publicContentEnabled() {
  return (
    (process.env.UTR_PUBLIC_CONTENT_ENABLED === "true" ||
      process.env.UTR_LIVE_ENABLED === "true") &&
    configuredEnvironment()
  );
}
