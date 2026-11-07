import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
export const MAX_UPLOAD = 4 * 1024 * 1024;
export async function safeImage(bytes: Buffer) {
  if (bytes.length > MAX_UPLOAD || !bytes.length) throw Error("invalid size");
  const kind = await fileTypeFromBuffer(bytes);
  if (
    !kind ||
    !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
      kind.mime,
    )
  )
    throw Error("invalid format");
  if (kind.mime === "application/pdf") {
    const pdf = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    if (
      pdf.getPageCount() !== 1 ||
      /\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction|AA)\b/.test(
        bytes.toString("latin1"),
      )
    )
      throw Error("PDF must be one page without active content");
    return {
      bytes,
      mime: kind.mime,
      originalMime: kind.mime,
      needsScanner: true,
    };
  }
  const image = sharp(bytes, { limitInputPixels: 40000000, animated: false });
  const meta = await image.metadata();
  if (!meta.width || !meta.height || (meta.pages && meta.pages > 1))
    throw Error("invalid image");
  const clean = await image
    .rotate()
    .resize({
      width: 2600,
      height: 3600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 92 })
    .toBuffer();
  return {
    bytes: clean,
    mime: "image/jpeg",
    originalMime: kind.mime,
    needsScanner: false,
  };
}
