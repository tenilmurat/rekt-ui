import type { ComponentType } from "react";

/**
 * A knob in the component dialog. Each one maps to one prop of the component,
 * so the values a visitor tunes are exactly what the Usage snippet passes.
 */
export type UiControl =
  | { type: "segmented"; prop: string; label: string; options: { value: string; label: string }[]; default: string }
  | { type: "toggle"; prop: string; label: string; default: boolean }
  | { type: "slider"; prop: string; label: string; min: number; max: number; step: number; unit?: string; default: number };

export type ControlValues = Record<string, string | number | boolean>;

/**
 * One published component. Its source is real files a visitor takes home —
 * one .tsx and one .css, in components/blocks/<id>/ — so what the wall runs
 * is exactly what the Code tab hands out.
 */
export type UiBlock = {
  id: string;
  title: string;
  description: string;
  /** An id from UI_CATEGORIES. */
  category: string;
  /** "pro" keeps the source to paying accounts. Default "free". */
  tier?: "free" | "pro";
  /** The component itself, rendered with the control values as props. */
  component: ComponentType<ControlValues>;
  /** The exported component name, used in the Usage snippet. */
  name: string;
  /** File names in components/blocks/<id>/, the .tsx first. */
  files: string[];
  /** npm packages beyond React; empty means nothing to install. */
  dependencies?: string[];
  controls?: UiControl[];
  /** A short explanation of the technique, shown under "How it works". */
  howItWorks?: string;
  /** Card height on the wall in px; varied heights make the masonry. Default 380. */
  cardHeight?: number;
  /** Credit when the idea comes from someone else's work. */
  source?: { name: string; url?: string; license?: string };
};

export type SourceFile = { path: string; code: string };
