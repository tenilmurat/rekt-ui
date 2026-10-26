import type { UiBlockMeta } from "@/lib/ui/types";

/** Contents hook, described for the site: the wall, the dialog and the registry. Plain data only. */
export const contentsHookMeta: UiBlockMeta = {
  id: "contents-hook",
  title: "Contents hook",
  description:
    "A table of contents on a thin rail. The active section gets a hook: a line that draws itself down the rail and curves out to the item. Choosing a section scrolls to it.",
  category: "navigation",
  name: "ContentsHook",
  files: ["ContentsHook.tsx", "ContentsHook.css"],
  dependencies: [],
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
      default: "dashed",
    },
    { type: "slider", prop: "speed", label: "Draw", min: 150, max: 1200, step: 50, unit: "ms", default: 420 },
  ],
  howItWorks:
    "The list measures the centre of the section to hook and the height of the list, and an SVG beside it draws a faint rail plus the hook: a path down the rail from just above the item, round a small quadratic corner and out to the text. The path has pathLength=\"1\", so a dash of length 1 offset by 1 hides it and animating the offset to 0 draws it, whatever its real length. The hook group is keyed on the section, so every change remounts it and draws it fresh. A dashed line can't draw itself that way (its dashes are the dasharray), so the dashed style draws a solid copy inside an SVG mask and shows the dashed path through it. Items are real links that set aria-current and smooth-scroll to the matching id; reduced motion shows the hook at once.",
  cardHeight: 360,
};
