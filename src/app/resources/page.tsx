import { publicRecords } from "@/lib/data";
import { EditorialDirectory } from "@/components/editorial-directory";
import { ArrowUpLeft } from "lucide-react";
export default async function Resources() {
  return (
    <div className="container content">
      <header className="library-hero">
        <div>
          <h1>کتابخانه و منابع علمی</h1>
          <p>
            کتابخانه مرکزی دانشکدگان فارابی؛ دسترسی به کتاب‌ها، پایان‌نامه‌ها،
            پایگاه‌های علمی و راهنماهای پژوهش.
          </p>
          <a className="button" href="#library-tools">
            منبع موردنیازم را پیدا کنم <ArrowUpLeft size={18} />
          </a>
          <a
            className="source-link"
            href="https://farabi.ut.ac.ir/fa/page/4230"
            target="_blank"
            rel="noopener noreferrer"
          >
            صفحه رسمی کتابخانه
          </a>
        </div>
        <figure>
          <img
            src="/assets/official/page-4230-1.webp"
            alt="فضای داخلی کتابخانه مرکزی دانشکدگان فارابی؛ تصویر وبگاه رسمی"
            width="470"
            height="263"
          />
          <figcaption>کتابخانه مرکزی دانشکدگان فارابی دانشگاه تهران</figcaption>
        </figure>
      </header>
      <section className="library-intro">
        <h2>
          از قفسه کتاب
          <br />
          تا منابع دیجیتال
        </h2>
        <div>
          <p>
            کتابخانه دانشکدگان از اواخر سال ۱۳۴۹ فعالیت دارد. مجموعه کتاب‌ها،
            پایان‌نامه‌ها و نشریات، همراه با دسترسی به منابع الکترونیک دانشگاه
            تهران، از خدمات معرفی‌شده در صفحه رسمی کتابخانه است.
          </p>
          <p>
            برای عضویت، امانت و دسترسی به متن کامل، شرایط جاری کتابخانه را بررسی
            کنید. خدمات امانت در سامانه و محل کتابخانه انجام می‌شود.
          </p>
        </div>
      </section>
      <section id="library-tools">
        <h2>دسترسی سریع به منابع و خدمات</h2>
        <EditorialDirectory
          kind="resources"
          records={await publicRecords("content", "resources")}
        />
      </section>
      <div className="reading-guide">
        <h2>داخل یا خارج دانشگاه؟</h2>
        <div>
          <p>
            داخل شبکه دانشگاه، منابع الکترونیک را از صفحه پایگاه‌های اطلاعات
            علمی باز کنید. برای استفاده خارج از دانشگاه، راهنمای اتصال رسمی
            دانشگاه را دنبال کنید.
          </p>
          <p>
            محدودیت دسترسی هر منبع تابع اشتراک و مقررات دانشگاه است. UTR اطلاعات
            ورود دانشگاهی شما را برای این خدمات دریافت نمی‌کند.
          </p>
        </div>
      </div>
    </div>
  );
}
