import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { liveEnabled } from "@/lib/config";
export async function database() {
  if (!liveEnabled()) throw new Error("سامانه عملیاتی هنوز فعال نشده است.");
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server Components refresh through proxy. */
          }
        },
      },
    },
  );
}
export async function identity() {
  const db = await database();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new Error("ابتدا وارد حساب خود شوید.");
  return { db, user: data.user };
}
