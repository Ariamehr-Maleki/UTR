import { notFound, redirect } from "next/navigation";
import { identity } from "@/lib/supabase/server";
import { liveEnabled } from "@/lib/config";
import { persianDate } from "@/lib/time";
import { PrintButton } from "@/components/print-button";
export default async function Certificate({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!liveEnabled()) redirect("/workspace");
  const { db, user } = await identity();
  const { id } = await params;
  const { data: c } = await db
    .from("certificates")
    .select("*")
    .eq("id", id)
    .eq("student_id", user.id)
    .single();
  if (!c) notFound();
  const title = (
    {
      membership: "گواهی عضویت",
      attendance: "گواهی حضور",
      participation: "گواهی مشارکت",
    } as Record<string, string>
  )[c.kind];
  return (
    <div className="container section">
      <article className="certificate">
        <img
          src="/assets/farabi-emblem.png"
          width="100"
          height="100"
          alt="دانشگاه تهران"
        />
        <p>معاونت پژوهش و فناوری دانشکدگان فارابی دانشگاه تهران</p>
        <h1>{title}</h1>
        {c.revoked_at ? (
          <h2>این گواهی باطل شده است</h2>
        ) : (
          <>
            <p>این گواهی برای</p>
            <h2>{c.public_name}</h2>
            <p>با بررسی و تصمیم معاونت پژوهشی صادر شده است.</p>
          </>
        )}
        <p>تاریخ صدور: {persianDate(c.issued_at)}</p>
        <p>
          شناسه استعلام: <bdi>{c.verification_id}</bdi>
        </p>
        <p>
          <a href={`/verify/result?id=${c.verification_id}`}>
            استعلام برخط اعتبار گواهی
          </a>
        </p>
        <small>این گواهی به معنای ثبت نمره در سامانه رسمی دانشگاه نیست.</small>
      </article>
      {!c.revoked_at && <PrintButton />}
    </div>
  );
}
