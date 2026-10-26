/**
 * Aspect ratios and the crop that produces them.
 *
 * The crop is taken from the centre at the source's own resolution — never
 * scaled up — so the output keeps as many original pixels as the ratio allows.
 */
export type RatioId = "original" | "1-1" | "4-3" | "3-2" | "16-9" | "9-16" | "4-5" | "custom";

export const RATIOS: { id: RatioId; label: string; value: number | null }[] = [
  { id: "original", label: "Original", value: null },
  { id: "1-1", label: "1:1", value: 1 },
  { id: "4-3", label: "4:3", value: 4 / 3 },
  { id: "3-2", label: "3:2", value: 3 / 2 },
  { id: "16-9", label: "16:9", value: 16 / 9 },
  { id: "9-16", label: "9:16", value: 9 / 16 },
  { id: "4-5", label: "4:5", value: 4 / 5 },
  { id: "custom", label: "Custom", value: null },
];

export function ratioValue(id: RatioId, width: number, height: number) {
  if (id === "original") return null;
  if (id === "custom") {
    const w = Number(width);
    const h = Number(height);
    return w > 0 && h > 0 ? w / h : null;
  }
  return RATIOS.find((r) => r.id === id)?.value ?? null;
}

/** Centre crop to the target ratio; null ratio means the image as it came. */
export function cropToRatio(image: HTMLImageElement, ratio: number | null) {
  const sw = image.naturalWidth || image.width;
  const sh = image.naturalHeight || image.height;
  if (!sw || !sh) return null;

  let cropW = sw;
  let cropH = sh;
  if (ratio) {
    if (sw / sh > ratio) cropW = Math.round(sh * ratio);
    else cropH = Math.round(sw / ratio);
  }

  const sx = Math.round((sw - cropW) / 2);
  const sy = Math.round((sh - cropH) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
  return canvas;
}

/** JPEGs stay JPEGs, WEBPs stay WEBPs, everything else is a PNG. */
export function outputTypeFor(fileType: string | null) {
  if (fileType === "image/jpeg") return { type: "image/jpeg", extension: "jpg", quality: 0.92 };
  if (fileType === "image/webp") return { type: "image/webp", extension: "webp", quality: 0.92 };
  return { type: "image/png", extension: "png", quality: undefined };
}

export const ratioFilename = (id: RatioId, extension: string) =>
  `rekt-${id === "original" ? "original" : id}.${extension}`;
