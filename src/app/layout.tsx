import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "./globals.css";
import "./experience.css";
import "./workspace.css";
import "./refinement.css";
import "./landing-refresh.css";
import { SiteHeader } from "@/components/site-header";
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
        <SiteHeader />
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
