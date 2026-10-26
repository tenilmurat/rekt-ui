/**
 * Turning the ASCII back into a picture.
 *
 * The grid is drawn onto a canvas with the same monospace metrics the screen
 * uses — advance width measured from the font itself, line height equal to the
 * type size — so the exported image matches what the display shows. It is drawn
 * at device pixel ratio so the characters stay crisp.
 */
const PAD = 24;
const FONT_SIZE = 16;

const fontStack = (size: number) =>
  `${size}px ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace`;

export function asciiToCanvas(
  rows: string[],
  { color, background }: { color: string; background: string },
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx || rows.length === 0) return null;

  const scale = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  ctx.font = fontStack(FONT_SIZE);
  const advance = ctx.measureText("M").width || FONT_SIZE * 0.6;
  const cols = rows.reduce((widest, row) => Math.max(widest, row.length), 0);

  const width = Math.ceil(cols * advance + PAD * 2);
  const height = Math.ceil(rows.length * FONT_SIZE + PAD * 2);
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  ctx.scale(scale, scale);

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  // the font resets with the canvas size, so it is set again after scaling
  ctx.font = fontStack(FONT_SIZE);
  ctx.textBaseline = "top";
  ctx.fillStyle = color;
  rows.forEach((row, index) => {
    ctx.fillText(row, PAD, PAD + index * FONT_SIZE);
  });

  return canvas;
}

/** The colours the display is using right now, so the export matches the theme. */
export function currentInk() {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return { color: read("--ink", "#141210"), background: read("--surface", "#f5f5f5") };
}
