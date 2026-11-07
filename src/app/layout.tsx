import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "UTR | پلتفرم پژوهش و فناوری دانشکدگان فارابی",
    template: "%s | UTR",
  },
  description:
    "پلتفرم جامع معاونت پژوهش و فناوری دانشکدگان فارابی دانشگاه تهران",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip" href="#main">
          رفتن به محتوای اصلی
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link className="brand" href="/">
              <img
                src="/assets/ut-emblem.png"
                width="48"
                height="48"
                alt="نشان دانشگاه تهران"
              />
              <span>
                <b dir="ltr">UTR</b>
                <small>پژوهش و فناوری · دانشکدگان فارابی</small>
              </span>
            </Link>
            <nav aria-label="ناوبری اصلی">
              <Link href="/events">رویدادها</Link>
              <Link href="/club">باشگاه پژوهشیاران</Link>
              <Link href="/opportunities">فرصت‌های پژوهشی</Link>
              <Link href="/resources">منابع علمی</Link>
            </nav>
            <Link className="button small" href="/auth/login">
              ورود به سامانه
            </Link>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="footer">
          <div className="container footer-grid">
            <div>
              <strong>UTR — University of Tehran Research</strong>
              <p>
                پلتفرم جامع معاونت پژوهش و فناوری
                <br />
                دانشکدگان فارابی دانشگاه تهران
              </p>
              <small>دامنه فعالیت این سامانه، دانشکدگان فارابی است.</small>
            </div>
            <div>
              <Link href="/about">درباره ما و ارتباط با ما</Link>
              <Link href="/privacy">حریم خصوصی</Link>
              <Link href="/policy">قوانین مشارکت</Link>
              <Link href="/verify">استعلام گواهی</Link>
            </div>
            <div>
              <p>از یک پرسش شروع می‌شود.</p>
              <span>دانش، گفت‌وگو و فرصت‌های تازه برای پژوهش.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
