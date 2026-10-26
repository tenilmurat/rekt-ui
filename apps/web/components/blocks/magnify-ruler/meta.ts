import type { UiBlockMeta } from "@/lib/ui/types";

/** Magnify ruler, described for the site: the wall, the dialog and the registry. Plain data only. */
export const magnifyRulerMeta: UiBlockMeta = {
  id: "magnify-ruler",
  title: "Magnify ruler",
  description:
    "A vertical ruler of ticks that grow toward your pointer, like a magnifier passing over them. Section names fade in as you get close, and a click jumps to the nearest section.",
  category: "navigation",
  name: "MagnifyRuler",
  files: ["MagnifyRuler.tsx", "MagnifyRuler.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "fill",
      label: "Fill",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
      default: "light",
    },
    { type: "slider", prop: "reach", label: "Reach", min: 16, max: 140, step: 4, unit: "px", default: 56 },
    { type: "slider", prop: "strength", label: "Strength", min: 0, max: 60, step: 2, unit: "px", default: 28 },
    { type: "toggle", prop: "labels", label: "Labels", default: true },
  ],
  howItWorks:
    "Each tick is a 7px row with a 1px line. On pointer move the component works out, once per frame, how far each tick's centre is from the pointer and turns that into a bell curve, g = e^−(distance ÷ reach)², written to the tick as --rk-ruler-g. The CSS does the rest: the line's width is its base length plus Strength × g, its colour mixes from faint to strong by g (color-mix), and section names fade and slide in by the same value, so everything near the pointer swells together and settles back when you leave. Every tenth tick is a section: a full-row button that sets aria-current and smooth-scrolls to the matching id; clicking between them picks the nearest section, and keyboard focus magnifies around the focused one.",
  cardHeight: 420,
};
