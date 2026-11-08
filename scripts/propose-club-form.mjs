import fs from "node:fs/promises";
import { chromium } from "@playwright/test";
const directory = ".impeccable/review/form-proposal";
await fs.mkdir(directory, { recursive: true });
const font = (
  await fs.readFile(
    "node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-400-normal.woff2",
  )
).toString("base64");
const logo = (await fs.readFile("public/assets/ut-emblem.png")).toString(
  "base64",
);
const html = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><style>
@font-face{font-family:Vazirmatn;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{font-family:Vazirmatn;margin:0;color:#101e36;font-size:11px;line-height:1.8} @page{size:A4;margin:14mm}header{display:flex;align-items:center;gap:15px;border-bottom:2px solid #123f7b;padding-bottom:12px}header img{width:60px;height:60px;object-fit:contain}h1{font-size:19px;margin:0;color:#123f7b}p{margin:2px 0}.draft{font-size:10px;color:#53657a;margin-right:auto;text-align:left}.fields{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin-top:12px}.field{height:11mm;border-bottom:1px solid #b4c4d0}.wide{grid-column:1/-1}.instructions{padding:10px 0;color:#304865;font-size:10px}.writing{border:1px solid #8da8bd;padding:0 12px}.writing div{height:6.8mm;border-bottom:1px solid #dce5ed}.writing div:last-child{border:0}footer{display:flex;justify-content:space-between;gap:20px;font-size:9px;margin-top:10px;color:#53657a}.tag{color:#a22336}
</style><body><header><img src="data:image/png;base64,${logo}"><div><p>دانشگاه تهران · دانشکدگان فارابی</p><h1>خلاصهٔ دست‌نویس نشست پژوهشی</h1><p>باشگاه پژوهشیاران — یک نشست، یک خلاصه، یک قدم جلوتر</p></div><div class="draft"><span class="tag">پیشنهاد برای تصویب</span><br><bdi>UTR-RFC-01</bdi></div></header>
<section class="fields"><div class="field">نام و نام خانوادگی:</div><div class="field">شماره دانشجویی:</div><div class="field">گروه آموزشی و مقطع:</div><div class="field">تاریخ برگزاری نشست:</div><div class="field wide">عنوان نشست:</div><div class="field">درس مرتبط در نیمسال جاری:</div><div class="field">نام استاد درس:</div></section>
<p class="instructions">خلاصه را با خط خوانا، در همین یک صفحه بنویسید. نکات اصلی نشست و ارتباط آن با درس انتخابی را توضیح دهید. تصویر کامل و واضح صفحه را در سامانه بارگذاری کنید؛ تحویل کاغذی لازم نیست.</p>
<div class="writing">${Array.from({ length: 22 }, () => "<div></div>").join("")}</div><footer><span>هر نشست فقط به یک درس و استاد تخصیص می‌یابد. میزان امتیاز را استاد تعیین می‌کند.</span><span>نسخهٔ پیشنهادی؛ تا تصویب معاونت، فرم رسمی نیست.</span></footer></body></html>`;
await fs.writeFile(`${directory}/proposal.html`, html);
const browser = await chromium.launch({
  channel: process.platform === "win32" ? "msedge" : undefined,
});
try {
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
  });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: `${directory}/UTR-club-form-proposal.pdf`,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await page.screenshot({ path: `${directory}/proposal.png`, fullPage: true });
} finally {
  await browser.close();
}
console.log(
  "Created a draft only; no publication or institutional approval inferred.",
);
