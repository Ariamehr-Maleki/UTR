'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="container section"><h1>دریافت اطلاعات ممکن نشد</h1><p>لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید. اطلاعات قبلی شما حذف نشده است.</p><button onClick={reset}>تلاش دوباره</button></div>}
