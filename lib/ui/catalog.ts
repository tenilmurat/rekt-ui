import type { ComponentItem } from "@/lib/registry/types";

/**
 * What the UI wall shows. It starts empty on purpose: components are added here
 * one by one once they are designed and reviewed.
 *
 * To publish one: build its preview in components/previews/, then add a
 * ComponentItem below with `category` set to an id from UI_CATEGORIES. The
 * earlier curated set in lib/registry/categories is not published; move an item
 * here only after checking it.
 */
export type UiCategory = { id: string; label: string };

/** Filter chips on the wall. Placeholder set until the categories are decided. */
export const UI_CATEGORIES: UiCategory[] = [
  { id: "hover", label: "Hover" },
  { id: "press", label: "Press" },
  { id: "drag", label: "Drag" },
  { id: "scroll", label: "Scroll" },
  { id: "type", label: "Type" },
  { id: "select", label: "Select" },
  { id: "loading", label: "Loading" },
  { id: "text", label: "Text" },
];

/** A published component, plus how tall its card is on the wall. */
export type UiBlock = ComponentItem & {
  /** Card height on the wall in px; varied heights make the masonry. Default 380. */
  cardHeight?: number;
};

export const BLOCKS: UiBlock[] = [];

export const getBlock = (id: string) => BLOCKS.find((b) => b.id === id);
