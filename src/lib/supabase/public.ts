import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicContentEnabled } from "../config";
// Public routes always use an anonymous, stateless client, even for signed-in admins.
export function publicDatabase() {
  if (!publicContentEnabled()) throw Error("Public content not configured");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}
