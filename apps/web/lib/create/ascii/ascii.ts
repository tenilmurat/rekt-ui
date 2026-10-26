/**
 * The ASCII engine. One pipeline for all three sources: whatever the user picks
 * — a Lucide icon, a logo or a photo — ends up as an <img>, gets drawn into a
 * tiny canvas at the grid's resolution, and each pixel becomes one character.
 *
 * Letting the browser downscale the image *is* the box filter: drawing into a
 * cols x rows canvas averages the source for us, so one pixel per cell is both
 * the cheapest and the most accurate read.
 */
import { getCharacterSet, mapBrightnessToCharacter, type CharacterSetId } from "@/lib/create/ascii/charsets";

/** Monospace advance / line height — the correction that stops output stretching. */
export const CHAR_ASPECT = 0.55;

/** Below this alpha a cell is treated as empty and never gets a character. */
const ALPHA_FLOOR = 0.08;

export type AsciiGrid = {
  rows: string[];
  /** Per cell, 0-1: how much of the mark is there. Blank cells are 0. */
  ink: number[][];
  cols: number;
  rowCount: number;
};

export const MIN_COLS = 24;
export const MAX_COLS = 132;

/** Density 0-1 to a column count. */
export const columnsForDensity = (density: number) =>
  Math.round(MIN_COLS + Math.min(1, Math.max(0, density)) * (MAX_COLS - MIN_COLS));

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that file"));
    image.src = src;
  });
}

/** An SVG string (a Lucide icon, or an uploaded .svg) as an image. */
export async function svgToImage(markup: string, size = 512): Promise<HTMLImageElement> {
  const sized = markup.includes("width=")
    ? markup.replace(/width="[^"]*"/, `width="${size}"`).replace(/height="[^"]*"/, `height="${size}"`)
    : markup.replace("<svg", `<svg width="${size}" height="${size}"`);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  return loadImage(url);
}

/** A picked file as an image; the caller revokes the URL when it is done. */
export async function fileToImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    return { image, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/** Draws the source at grid resolution. Nothing is painted underneath, so alpha survives. */
export function renderSourceToCanvas(image: HTMLImageElement, cols: number, rows: number) {
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, cols, rows);
  ctx.drawImage(image, 0, 0, cols, rows);
  return { canvas, ctx };
}

export function rowsForImage(image: HTMLImageElement, cols: number) {
  const width = image.naturalWidth || image.width || 1;
  const height = image.naturalHeight || image.height || 1;
  return Math.max(1, Math.round(cols * (height / width) * CHAR_ASPECT));
}

/**
 * The grid itself. Ink is alpha x darkness, so a black icon on transparency and
 * a photograph both read correctly, and anything transparent stays blank.
 */
export function generateAsciiGrid({
  image,
  cols,
  characterSet,
  customCharacters,
  invert,
}: {
  image: HTMLImageElement;
  cols: number;
  characterSet: CharacterSetId;
  customCharacters: string;
  invert: boolean;
}): AsciiGrid | null {
  const rowCount = rowsForImage(image, cols);
  const surface = renderSourceToCanvas(image, cols, rowCount);
  if (!surface) return null;

  const { data } = surface.ctx.getImageData(0, 0, cols, rowCount);
  const ramp = getCharacterSet(characterSet, customCharacters);

  // With alpha everywhere (a photo), darkness carries the image; with an icon or
  // a logo on transparency, coverage does.
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 20) opaque += 1;
  const mostlyOpaque = opaque / (cols * rowCount) > 0.92;

  const rows: string[] = [];
  const ink: number[][] = [];

  for (let y = 0; y < rowCount; y += 1) {
    let line = "";
    const inkRow: number[] = [];
    for (let x = 0; x < cols; x += 1) {
      const i = (y * cols + x) * 4;
      const alpha = data[i + 3] / 255;
      const luminance = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;

      if (alpha < ALPHA_FLOOR) {
        line += " ";
        inkRow.push(0);
        continue;
      }

      const value = mostlyOpaque ? 1 - luminance : alpha * (1 - luminance * 0.35);
      const clamped = Math.min(1, Math.max(0, value));
      line += clamped < 0.04 && !invert ? " " : mapBrightnessToCharacter(clamped, ramp, invert);
      inkRow.push(clamped);
    }
    rows.push(line);
    ink.push(inkRow);
  }

  return { rows, ink, cols, rowCount };
}

/** Trims fully blank rows and columns so the shape sits centred in the display. */
export function trimGrid(grid: AsciiGrid): AsciiGrid {
  const filled = grid.ink.map((row) => row.some((v) => v > 0));
  const top = filled.indexOf(true);
  const bottom = filled.lastIndexOf(true);
  if (top === -1) return grid;

  let left = grid.cols;
  let right = 0;
  for (let y = top; y <= bottom; y += 1) {
    for (let x = 0; x < grid.cols; x += 1) {
      if (grid.ink[y][x] > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (left > right) return grid;

  return {
    rows: grid.rows.slice(top, bottom + 1).map((row) => row.slice(left, right + 1)),
    ink: grid.ink.slice(top, bottom + 1).map((row) => row.slice(left, right + 1)),
    cols: right - left + 1,
    rowCount: bottom - top + 1,
  };
}
