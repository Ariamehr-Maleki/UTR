import { publicContentEnabled } from "./config";
import { connection } from "next/server";
import { publicDatabase } from "./supabase/public";
import official from "@/content/official.json";
export type RecordItem = {
  id: string;
  title: string;
  description: string;
  starts_at?: string;
  ends_at?: string;
  summary_deadline?: string;
  kind?: string;
  external_url?: string;
  club_approved?: boolean;
  venue?: string;
  speaker?: string;
  organizer?: string;
  online_url?: string;
  capacity?: number;
  registration_opens?: string;
  registration_closes?: string;
  status?: string;
  editorial?: {
    year?: string;
    date?: string;
    time?: string;
    speaker?: string;
    venue?: string;
    topic?: string;
    image?: string;
    source?: string;
    email?: string;
    phone?: string;
    order?: number;
  };
};
export async function publicRecords(
  table: "events" | "content",
  kind?: string,
): Promise<RecordItem[]> {
  // Production never falls back: editorial unpublishing must be respected.
  if (!publicContentEnabled())
    return table === "content" && process.env.VERCEL_ENV !== "production"
      ? (official as RecordItem[]).filter((r) => !kind || r.kind === kind)
      : [];
  await connection();
  const db = publicDatabase();
  let q = db.from(table).select("*");
  q =
    table === "events"
      ? q.in("status", ["published", "cancelled"])
      : q.eq("status", "published");
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q.order(
    table === "events" ? "starts_at" : "created_at",
    { ascending: table === "events" },
  );
  if (error) throw new Error("دریافت اطلاعات ممکن نیست. دوباره تلاش کنید.");
  return data || [];
}
