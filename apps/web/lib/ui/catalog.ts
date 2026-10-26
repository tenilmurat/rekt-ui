import { contentsHook } from "@/components/blocks/contents-hook";
import { contentsMarker } from "@/components/blocks/contents-marker";
import { magnifyRuler } from "@/components/blocks/magnify-ruler";
import { rollingCounter } from "@/components/blocks/rolling-counter";
import { tiltCard } from "@/components/blocks/tilt-card";
import type { UiBlock } from "@/lib/ui/types";

export type { UiBlock } from "@/lib/ui/types";

/**
 * What the UI wall shows. It starts empty on purpose: components are added
 * here one by one once they are designed and reviewed.
 *
 * A component is a folder in components/blocks/<id>/ holding exactly the
 * files a visitor takes home — <Name>.tsx and <Name>.css — plus an index.ts
 * that describes it as a UiBlock (see rolling-counter, the reference).
 * To publish it, import that UiBlock and add it to PUBLISHED.
 *
 * The earlier curated set in lib/registry/categories is not published.
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
  { id: "navigation", label: "Navigation" },
];

const PUBLISHED: UiBlock[] = [tiltCard];

/**
 * Shown only in `npm run dev`, so the whole flow — card, dialog, controls,
 * Install / Usage / Code / How it works, Copy prompt — can be checked locally
 * while the live wall stays empty.
 */
const EXAMPLES: UiBlock[] =
  process.env.NODE_ENV === "development" ? [contentsMarker, contentsHook, magnifyRuler, rollingCounter] : [];

export const BLOCKS: UiBlock[] = [...PUBLISHED, ...EXAMPLES];

export const getBlock = (id: string) => BLOCKS.find((b) => b.id === id);
