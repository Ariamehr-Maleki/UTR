import { it, expect } from "vitest";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { safeImage, MAX_UPLOAD } from "../src/lib/uploads";
it("rejects spoofed files and excessive size", async () => {
  await expect(
    safeImage(Buffer.from("<script>bad</script>")),
  ).rejects.toThrow();
  await expect(safeImage(Buffer.alloc(MAX_UPLOAD + 1))).rejects.toThrow();
});
it("re-encodes images and limits dimensions without upscaling", async () => {
  const bytes = await sharp({
    create: { width: 3000, height: 4000, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  const result = await safeImage(bytes);
  const meta = await sharp(result.bytes).metadata();
  expect(meta.width).toBeLessThanOrEqual(2600);
  expect(meta.height).toBeLessThanOrEqual(3600);
  expect(meta.exif).toBeUndefined();
  expect(result.originalMime).toBe("image/png");
});
it("allows one page PDF only for subsequent trusted scanning", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  expect((await safeImage(Buffer.from(await pdf.save()))).needsScanner).toBe(
    true,
  );
  pdf.addPage();
  await expect(safeImage(Buffer.from(await pdf.save()))).rejects.toThrow(
    "one page",
  );
});
