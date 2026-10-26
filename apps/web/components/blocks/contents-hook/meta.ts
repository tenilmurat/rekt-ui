import type { UiBlockMeta } from "@/lib/ui/types";

/** Contents hook, described for the site: the wall, the dialog and the registry. Plain data only. */
export const contentsHookMeta: UiBlockMeta = {
  id: "contents-hook",
  title: "Contents hook",
  description:
    "A sidebar of sections on a thin rail. Opening a section unfolds its items on tree connectors, the active item's connector redraws itself as a hook, and a bar on the rail slides to the open section.",
  category: "navigation",
  name: "ContentsHook",
  files: ["ContentsHook.tsx", "ContentsHook.css"],
  dependencies: ["lucide-react"],
  controls: [
    {
      type: "segmented",
      prop: "follow",
      label: "Follow",
      options: [
        { value: "hover", label: "Hover" },
        { value: "click", label: "Click" },
      ],
      default: "hover",
    },
    {
      type: "segmented",
      prop: "line",
      label: "Line",
      options: [
        { value: "solid", label: "Solid" },
        { value: "dashed", label: "Dashed" },
      ],
      default: "solid",
    },
    { type: "slider", prop: "speed", label: "Draw", min: 150, max: 1200, step: 50, unit: "ms", default: 420 },
    { type: "toggle", prop: "icons", label: "Icons", default: true },
  ],
  howItWorks:
    "Each section heading is a button with aria-expanded; opening one closes the others. Its items sit in a panel whose single grid row grows from 0fr to 1fr, so it unfolds to its natural height without measuring, and closed panels are inert so Tab skips them. Every item row carries a small SVG tree connector — down from the row above, round a quadratic corner, out to the item, plus a line on to the next row unless it's the last — so the rows together draw the tree. The hooked item (pointed at with Follow: Hover, otherwise the chosen one) gets the same connector again in the accent colour with pathLength=1, and animating its dash offset from 1 to 0 draws it from the top; it's keyed on the item, so every change redraws it. A bar on the rail slides to the open section's heading; a ResizeObserver on the sidebar re-measures it every frame while panels fold, so it rides along with the moving headings. Icons are Lucide (lucide-react). Items are real links that set aria-current and smooth-scroll to the matching id; reduced motion turns the drawing and sliding off.",
  cardHeight: 400,
};
