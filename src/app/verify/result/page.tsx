import { publicDatabase } from "@/lib/supabase/public";
import { publicContentEnabled } from "@/lib/config";
import { z } from "zod";
import { persianDate } from "@/lib/time";
export default async function Verification({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let certificate;
  if (publicContentEnabled() && z.uuid().safeParse(id).success) {
    const db = publicDatabase();
    const { data } = await db.rpc("verify_certificate", { p_verification: id });
    certificate = data?.[0];
  }
  return (
    <div className="container section prose">
      <h1>استعلام اعتبار گواهی</h1>
      {certificate ? (
        <div className="panel">
          <h2>
            {certificate.revoked ? "این گواهی باطل شده است" : "گواهی معتبر است"}
          </h2>
          <p>{certificate.public_name}</p>
          <p>
            نوع:{" "}
            {(
              {
                membership: "عضویت",
                attendance: "حضور",
                participation: "مشارکت",
              } as Record<string, string>
            )[certificate.kind] || "گواهی"}
          </p>
          <p>تاریخ صدور: {persianDate(certificate.issued_at)}</p>
          <p>این گواهی بیانگر نمره رسمی دانشگاه نیست.</p>
        </div>
      ) : (
        <div className="empty">
          گواهی معتبری با این شناسه در دسترس نیست. شناسه را بررسی کنید یا با
          صادرکننده تماس بگیرید.
        </div>
      )}
    </div>
  );
}
