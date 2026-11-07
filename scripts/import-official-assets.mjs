import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import sharp from "sharp";
// Re-download only the reviewed, provenance-listed public assets. No account data.
const manifest = JSON.parse(
  await fs.readFile("public/assets/official/provenance.json", "utf8"),
);
const browser = await chromium.launch({
  channel: process.platform === "win32" ? "msedge" : undefined,
});
try {
  const page = await browser.newPage();
  await page.goto("https://farabi.ut.ac.ir/fa/news/43935", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(7000);
  for (const item of manifest) {
    if (
      !item.source.startsWith("https://farabi.ut.ac.ir/images/") ||
      !/^\/assets\/official\/[a-zA-Z0-9.-]+\.webp$/.test(item.file)
    )
      throw Error("Invalid reviewed asset");
    const response = await page.request.get(item.source);
    if (!response.ok()) throw Error("Asset unavailable");
    await sharp(await response.body())
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile("public" + item.file);
    console.log(item.file);
  }
} finally {
  await browser.close();
}
