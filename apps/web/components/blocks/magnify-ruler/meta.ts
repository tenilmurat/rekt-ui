import type { UiBlockMeta } from "@/lib/ui/types";

/** Magnify ruler, described for the site: the wall, the dialog and the registry. Plain data only. */
export const magnifyRulerMeta: UiBlockMeta = {
  id: "magnify-ruler",
  title: "Magnify ruler",
  description:
    "A vertical ruler of ticks that grow toward your pointer, like a magnifier passing over them. Section names fade in as you get close, and the chosen section is orange; choose another and the orange steps there tick by tick.",
  category: "navigation",
  name: "MagnifyRuler",
  files: ["MagnifyRuler.tsx", "MagnifyRuler.css"],
  dependencies: [],
  controls: [
    { type: "slider", prop: "reach", label: "Reach", min: 16, max: 140, step: 4, unit: "px", default: 56 },
    { type: "slider", prop: "strength", label: "Strength", min: 0, max: 60, step: 2, unit: "px", default: 28 },
    { type: "toggle", prop: "labels", label: "Labels", default: true },
  ],
  howItWorks:
    "Each tick is a 7px row with a 1px line. The component works out how far each tick's centre is from the pointer and turns that into a bell curve, g = e^−(distance ÷ reach)². Rather than jumping there, every frame each tick closes part of the gap to its target (about 150ms to settle, scaled by the frame's length so it's the same at any refresh rate). Choosing a section sends the orange there tick by tick: a head moves from the old section to the new one on an ease-in-out (about 26ms a tick, between 360ms and 1s), every tick it reaches lights up fully and then fades back the same eased way, and the new section stays lit, so the colour runs down the ruler with a short trail. Choose again mid-way and it sets off from where the head is. Frames stop once everything is still, and the list is as wide as the longest a tick can grow, so the frame never changes size on hover. The eased values are written to each tick as --rk-ruler-g (growth) and --rk-ruler-a (orange). The CSS does the rest: the line's width is its base length plus Strength × g, its colour mixes from faint to strong by g (color-mix), and section names fade and slide in by the same value, so everything near the pointer swells together and settles back when you leave. Every tenth tick is a section: a full-row button that sets aria-current and smooth-scrolls to the matching id; clicking between them picks the nearest section, and keyboard focus magnifies around the focused one. Reduced motion skips the easing.",
  cardHeight: 440,
};
