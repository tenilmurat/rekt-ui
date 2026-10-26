import type { UiBlockMeta } from "@/lib/ui/types";

/** Contents hook, described for the site: the wall, the dialog and the registry. Plain data only. */
export const contentsHookMeta: UiBlockMeta = {
  id: "contents-hook",
  title: "Contents hook",
  description:
    "A sidebar of sections on a thin rail, each in its own colour. Opening a section unfolds its items on tree connectors, the chosen item gets a hook drawn from the top of the list, and a bar on the rail glides to the open section.",
  category: "navigation",
  name: "ContentsHook",
  files: ["ContentsHook.tsx", "ContentsHook.css"],
  dependencies: ["lucide-react"],
  controls: [
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
    { type: "slider", prop: "speed", label: "Draw", min: 300, max: 1600, step: 50, unit: "ms", default: 700 },
    { type: "toggle", prop: "icons", label: "Icons", default: true },
  ],
  howItWorks:
    "Each section heading is a button with aria-expanded; opening one closes the others. Its items sit in a panel whose single grid row grows from 0fr to 1fr, so it unfolds to its natural height without measuring, and closed panels are inert so Tab skips them. Every item row carries a small SVG tree connector, so the rows together draw the tree. The chosen item gets a hook on top: one path from the top of the list, down the trunk and round a quadratic corner to the item, with pathLength=1, so animating its dash offset from 1 to 0 draws it from the top; it's keyed on the item, so choosing another redraws it. Hovering only darkens the text. The rail bar is placed where the open heading will end up once the panels finish moving: any panel above it is still at full height when it opens, so subtracting those heights from the heading's position gives the target, and the bar glides there in one move with the same easing as the panels. Each section has its own colour for the bar, the hook and the chosen icon. Icons are Lucide (lucide-react). Timing is deliberately gentle (about 600–700ms on a soft ease-out); reduced motion turns it off.",
  cardHeight: 400,
};
