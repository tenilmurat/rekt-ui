import type { ComponentType } from "react";

/** Props every preview component receives from the shell. */
export type PreviewProps = {
  /** Set while the preview is off-screen or the tab is hidden — pause expensive work. */
  paused?: boolean;
  /** Timestamp the preview was first mounted, kept across Default <-> Full View. */
  startedAt?: number;
  /** True when rendered in Full View, for previews that want more room. */
  expanded?: boolean;
  [key: string]: unknown;
};

export type ComponentPreset = {
  id: string;
  label: string;
  props: Record<string, unknown>;
};

export type CodeDetails = {
  /** Usage snippet shown in the Code panel. */
  usage: string;
  props?: { name: string; type: string; description: string }[];
  dependencies?: string[];
  notes?: string[];
  /** False when the original source may not be redistributed — usage only. */
  sourceIncluded?: boolean;
};

export type ComponentItem = {
  id: string;
  title: string;
  description: string;
  category: string;

  sourceName?: string;
  sourceUrl?: string;
  instructionUrl?: string;
  /** Path under /public for the source mark; falls back to a monogram. */
  sourceLogo?: string;
  license?: string;
  attributionRequired?: boolean;

  component: ComponentType<PreviewProps>;
  /**
   * "canvas" (the default) draws the grey display card from the design.
   * "bare" is for components that already carry their own frame — the card
   * would be a frame inside a frame — and lets them size to their content.
   */
  surface?: "canvas" | "bare";
  /**
   * True for previews that play once and stop — a one-shot reveal, a run, a flow.
   * The canvas then offers a replay button, which remounts the preview.
   * Leave it off for animations that loop on their own, and for static or
   * pointer-driven components, where a replay button would mean nothing.
   */
  replay?: boolean;
  presets?: ComponentPreset[];
  code?: CodeDetails;
  /** "pro" keeps the code to paying accounts; the preview stays open to everyone. Default "free". */
  tier?: "free" | "pro";
  tags?: string[];
};

export type ComponentCategory = {
  id: string;
  name: string;
  group: "components" | "create";
  /** Shown on the category page when it has no entries yet. */
  summary?: string;
  items: ComponentItem[];
};
