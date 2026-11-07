export function liveEnabled() {
  if (process.env.UTR_LIVE_ENABLED !== "true") return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return false;
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
