import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const root = ".impeccable/review/experience";
await fs.mkdir(root, { recursive: true });
const b = await chromium.launch({
  channel: process.platform === "win32" ? "msedge" : undefined,
});
const p = await b.newPage({ reducedMotion: "reduce" });
const results = [];
async function captureFull(path) {
  await p.locator("img").evaluateAll(async (images) => {
    images.forEach((image) => (image.loading = "eager"));
    await Promise.race([
      Promise.all(images.map((image) => image.decode().catch(() => {}))),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);
  });
  await p.evaluate(async () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await p.screenshot({ path, fullPage: true });
}
for (const width of [390, 768, 1440]) {
  await p.setViewportSize({ width, height: 950 });
  await p.goto(process.env.TEST_BASE_URL || "http://127.0.0.1:3111");
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${root}/hero-${width}.png` });
  await p.getByLabel("جست‌وجو در UTR", { exact: true }).fill("هوش مصنوعی");
  await p.screenshot({ path: `${root}/search-${width}.png` });
  results.push({
    width,
    searchOverflow: await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  });
  await p.getByLabel("جست‌وجو در UTR", { exact: true }).fill("zzzzzz");
  await p.screenshot({ path: `${root}/empty-search-${width}.png` });
  if (width < 950) {
    await p.getByRole("button", { name: "باز کردن فهرست" }).click();
    await p.screenshot({ path: `${root}/navigation-${width}.png` });
    await p.keyboard.press("Escape");
  }
  await p.getByLabel("جست‌وجو در UTR", { exact: true }).fill("");
  await p.getByLabel("نوع محتوا").selectOption("resources");
  await captureFull(`${root}/search-limited-${width}.png`);
  await p.getByRole("button", { name: "نمایش نتایج بیشتر" }).click();
  await captureFull(`${root}/search-expanded-${width}.png`);
  results.push({
    width,
    expandedResults: await p.locator(".finder-result").count(),
  });
  await p.goto(
    (process.env.TEST_BASE_URL || "http://127.0.0.1:3111") + "/club",
  );
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${root}/club-${width}.png`, fullPage: true });
}
console.log(JSON.stringify(results));
await b.close();
