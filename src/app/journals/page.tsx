import { publicRecords } from "@/lib/data";
import { EditorialDirectory } from "@/components/editorial-directory";
import { ArrowUpLeft } from "lucide-react";
export default async function Journals() {
  return (
    <div className="container content">
      <header className="page-head editorial-head">
        <div>
          <h1>
            پژوهش،
            <br />
            در صفحه‌های بعد.
          </h1>
          <p>
            نشریات علمی دانشکدگان فارابی دانشگاه تهران؛ از یافتن مجله مرتبط تا
            دسترسی به مقاله و راهنمای نویسندگان.
          </p>
        </div>
        <div className="head-note">
          <strong>نشریات علمی</strong>
          <p>ارسال و پیگیری مقاله در سامانه رسمی هر مجله انجام می‌شود.</p>
          <a
            href="https://farabi.ut.ac.ir/fa/page/4231"
            target="_blank"
            rel="noopener noreferrer"
          >
            فهرست رسمی دانشکدگان <ArrowUpLeft size={17} />
          </a>
        </div>
      </header>
      <EditorialDirectory
        kind="journals"
        records={await publicRecords("content", "journals")}
      />
      <section className="reading-guide">
        <h2>پیش از ارسال مقاله</h2>
        <div>
          <p>
            ابتدا حوزه موضوعی مجله و راهنمای نویسندگان را بخوانید. برای ارسال
            نخستین مقاله، در سامانه همان نشریه حساب بسازید؛ حساب UTR جایگزین
            حساب مجله نیست.
          </p>
          <p>
            وضعیت مقاله را از «سابقه مقاله» پیگیری کنید. راه‌های ارتباط با دفتر
            هر نشریه در فهرست بالا آمده است.
          </p>
        </div>
      </section>
    </div>
  );
}
