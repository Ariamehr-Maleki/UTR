import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const root = process.env.REVIEW_OUTPUT || ".impeccable/review/redesign";
await fs.mkdir(root, { recursive: true });
const browser = await chromium.launch({
  channel: process.platform === "win32" ? "msedge" : undefined,
});
const page = await browser.newPage({ reducedMotion: "reduce" });
const routes = [
  "/",
  "/events",
  "/journals",
  "/resources",
  "/club",
  "/auth/login",
  "/preview/student",
  "/preview/instructor",
  "/about",
  "/policy",
  "/privacy",
  "/opportunities",
  "/news",
];
const results = [];
for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: 950 });
  for (const route of routes) {
    await page.goto(
      (process.env.TEST_BASE_URL || "http://127.0.0.1:3110") + route,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.locator("img").evaluateAll(async (imgs) => {
      imgs.forEach((i) => (i.loading = "eager"));
      await Promise.race([
        Promise.all(imgs.map((i) => i.decode().catch(() => {}))),
        new Promise((r) => setTimeout(r, 8000)),
      ]);
    });
    const name =
      (route === "/" ? "home" : route.slice(1).replaceAll("/", "-")) +
      "-" +
      width;
    await page.screenshot({ path: root + "/" + name + ".png", fullPage: true });
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images]
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.src),
    }));
    results.push({ name, ...state });
    console.log(name, JSON.stringify(state));
  }
}
await fs.writeFile(root + "/checks.json", JSON.stringify(results, null, 2));
await browser.close();
