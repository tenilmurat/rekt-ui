import type { UiBlockMeta } from "@/lib/ui/types";

/** Theme toggler, described for the site: the wall, the dialog and the registry. Plain data only. */
export const themeTogglerMeta: UiBlockMeta = {
  id: "theme-toggler",
  title: "Theme toggler",
  description:
    "A sun that turns into a moon, just the icon. Click it and the whole page switches between light and dark: the new theme grows out of the icon in a circle, diamond, hexagon or star until it covers the screen. Try it here: every component on the wall has a dark theme.",
  category: "press",
  name: "ThemeToggler",
  files: ["ThemeToggler.tsx", "ThemeToggler.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "shape",
      label: "Shape",
      options: [
        { value: "circle", label: "●" },
        { value: "diamond", label: "◆" },
        { value: "hexagon", label: "⬢" },
        { value: "star", label: "★" },
      ],
      default: "circle",
    },
    {
      type: "segmented",
      prop: "from",
      label: "Grow from",
      options: [
        { value: "button", label: "Button" },
        { value: "center", label: "Center" },
      ],
      default: "button",
    },
    { type: "slider", prop: "duration", label: "Duration", min: 200, max: 1400, step: 50, unit: "ms", default: 500 },
  ],
  howItWorks:
    "The theme is the class \"dark\" on <html>, the convention shadcn and next-themes use, so anything styled for .dark follows it. The button reads that class with useSyncExternalStore and a MutationObserver, so it always shows the page's real theme, however it was changed. On click it measures the button's middle (or the screen's, with Grow from: Center) and works out two clip-paths in percentages of the viewport: the shape shrunk to that point, and grown until even its innermost edge (a polygon's flat side, a star's notch) is past the farthest corner. Then document.startViewTransition() snapshots the page, the class is flipped inside its callback (with flushSync, so React has re-rendered before the new snapshot), and once the transition is ready the new page's ::view-transition-new(root) is animated from the first clip-path to the second over Duration, eased in and out. The CSS turns off the default crossfade and holds the new page clipped to nothing until that animation starts, so it never flashes in whole. The icon is one SVG: a disc, a masked circle that slides in to bite it into a crescent, and eight rays that turn and shrink away; after the first click those changes play as keyframes, so they still run if the page turns transitions off while switching theme. Pass onThemeChange to hand the new theme to whatever owns it (next-themes' setTheme, say); without it the toggler saves it to localStorage under \"theme\". Without View Transitions, or with reduced motion, the theme switches at once.",
  cardHeight: 260,
};
