/**
 * One accent in, a whole syntax palette out.
 *
 * The user picks a single colour; keywords take it at full strength, strings and
 * numbers are neighbours on the wheel, functions and properties come from the
 * complementary side, and comments/punctuation stay neutral so they never
 * compete. Lightness is chosen per theme so every colour clears WCAG AA on the
 * code surface (AGENTS.md: text >= 4.5:1).
 */
export type Mode = "light" | "dark";

export type AccentId = "red" | "blue" | "orange" | "purple" | "green" | "custom";

export const ACCENTS: { id: AccentId; label: string; hex: string }[] = [
  { id: "red", label: "Red", hex: "#e5484d" },
  { id: "blue", label: "Blue", hex: "#2f6fec" },
  { id: "orange", label: "Orange", hex: "#f75001" },
  { id: "purple", label: "Purple", hex: "#8a5cf6" },
  { id: "green", label: "Green", hex: "#12a150" },
  { id: "custom", label: "Custom", hex: "#0ea5b7" },
];

export const accentHex = (id: AccentId, custom: string) =>
  id === "custom" ? custom : (ACCENTS.find((a) => a.id === id)?.hex ?? "#f75001");

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  if ([r, g, b].some(Number.isNaN)) return [18, 92, 49];

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, Math.round(l * 100)];

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

const spin = (h: number, by: number) => (h + by + 360) % 360;
const hsl = (h: number, s: number, l: number) => `hsl(${h} ${clamp(s, 0, 100)}% ${clamp(l, 0, 100)}%)`;

/** The code surface each mode paints on — mirrors --surface in globals.css. */
const SURFACE: Record<Mode, [number, number, number]> = { light: [245, 245, 245], dark: [23, 22, 21] };

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const S = clamp(s, 0, 100) / 100;
  const L = clamp(l, 0, 100) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

const luminance = ([r, g, b]: [number, number, number]) => {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a: [number, number, number], b: [number, number, number]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Nudges lightness until the colour clears WCAG AA on the code surface
 * (AGENTS.md: text >= 4.5:1). Hue and saturation are left alone, so the palette
 * still reads as one family — and a custom accent gets the same treatment as a
 * preset, whatever the user picks.
 */
function fit(h: number, s: number, l: number, mode: Mode, target = 4.5) {
  const bg = SURFACE[mode];
  const step = mode === "light" ? -1 : 1;
  let L = l;
  for (let i = 0; i < 80; i += 1) {
    if (contrast(hslToRgb(h, s, L), bg) >= target) break;
    const next = L + step;
    if (next < 0 || next > 100) break;
    L = next;
  }
  return hsl(h, s, L);
}

export type SyntaxPalette = {
  plain: string;
  keyword: string;
  string: string;
  number: string;
  func: string;
  property: string;
  operator: string;
  comment: string;
  punctuation: string;
  wash: string;
};

export function buildPalette(accent: string, mode: Mode): SyntaxPalette {
  const [h, rawS] = hexToHsl(accent);
  const s = clamp(rawS, 42, 92);

  if (mode === "dark") {
    return {
      plain: "var(--ink)",
      keyword: fit(h, s, 68, mode),
      string: fit(spin(h, 20), s - 14, 73, mode),
      number: fit(spin(h, -16), s, 76, mode),
      func: fit(spin(h, 162), s - 16, 71, mode),
      property: fit(spin(h, 162), s - 30, 79, mode),
      operator: fit(h, s - 28, 64, mode),
      comment: "var(--ink-3)",
      punctuation: "var(--ink-2)",
      wash: `hsl(${h} ${s}% 60% / 0.14)`,
    };
  }

  return {
    plain: "var(--ink)",
    keyword: fit(h, s, 38, mode),
    string: fit(spin(h, 20), s - 8, 40, mode),
    number: fit(spin(h, -16), s, 36, mode),
    func: fit(spin(h, 162), s - 10, 31, mode),
    property: fit(spin(h, 162), s - 22, 36, mode),
    operator: fit(h, s - 22, 44, mode),
    comment: "var(--ink-3)",
    punctuation: "var(--ink-2)",
    wash: `hsl(${h} ${s}% 45% / 0.10)`,
  };
}

/** prism-react-renderer theme built from the palette above. */
export function buildPrismTheme(palette: SyntaxPalette) {
  return {
    plain: { color: palette.plain, backgroundColor: "transparent" },
    styles: [
      { types: ["comment", "prolog", "doctype", "cdata"], style: { color: palette.comment, fontStyle: "italic" as const } },
      { types: ["keyword", "boolean", "constant", "atrule", "important", "rule", "tag"], style: { color: palette.keyword } },
      { types: ["string", "char", "attr-value", "inserted", "regex", "url"], style: { color: palette.string } },
      { types: ["number", "unit", "symbol"], style: { color: palette.number } },
      { types: ["function", "class-name", "builtin", "selector", "function-variable"], style: { color: palette.func } },
      { types: ["property", "attr-name", "variable", "property-access", "parameter"], style: { color: palette.property } },
      { types: ["operator", "entity", "keyword-operator"], style: { color: palette.operator } },
      { types: ["punctuation", "plain-text"], style: { color: palette.punctuation } },
      { types: ["deleted"], style: { color: "var(--red)" } },
      { types: ["namespace"], style: { opacity: 0.7 } },
    ],
  };
}
