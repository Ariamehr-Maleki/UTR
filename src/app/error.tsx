"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="container section">
      <h1>دریافت اطلاعات انجام نشد</h1>
      <p>
        ممکن است ارتباط موقتاً قطع شده باشد. اطلاعات ثبت‌شده شما حفظ شده است.
      </p>
      <button onClick={reset}>تلاش دوباره</button>
    </section>
  );
}
