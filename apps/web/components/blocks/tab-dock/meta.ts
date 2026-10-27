import type { UiBlockMeta } from "@/lib/ui/types";

/** Tab dock, described for the site: the wall, the dialog and the registry. Plain data only. */
export const tabDockMeta: UiBlockMeta = {
  id: "tab-dock",
  title: "Tab dock",
  description:
    "A row of icon tabs where only the selected tab shows its name, in a soft pill that glides across as the name opens out. The thin line between the groups works like the separator in the macOS Dock: hover it and the cursor turns into up-and-down chevrons, then drag up to make the menu bigger or down to make it smaller.",
  category: "navigation",
  name: "TabDock",
  files: ["TabDock.tsx", "TabDock.css"],
  dependencies: ["lucide-react"],
  controls: [
    { type: "slider", prop: "size", label: "Size", min: 0.8, max: 1.25, step: 0.05, unit: "×", default: 1 },
    { type: "slider", prop: "speed", label: "Speed", min: 200, max: 900, step: 20, unit: "ms", default: 420 },
    { type: "toggle", prop: "resizable", label: "Resize line", default: true },
  ],
  howItWorks:
    "Each tab is a button with a Lucide icon and its name. The name sits in a one-column grid that transitions from 0fr to 1fr when the tab is selected, so it opens out to exactly the width of the text and fades in once there's room; the tab's padding eases at the same time. Behind the tabs, one pill is placed with an inline transform and width. On a change it glides: each frame it blends from where it set off toward the selected tab's layout box at that moment (offsetLeft and offsetWidth, which a transformed parent can't skew), so it lands exactly on the tab as its name finishes opening. Every size in the CSS is multiplied by --rk-dock-scale. The line is a focusable separator with a wider hit area; its cursor is Lucide's chevrons-up-down drawn as an inline SVG on a white halo. Pressing it captures the pointer, and dragging up makes the scale bigger and down makes it smaller (about one step per 180px), between minSize and maxSize (0.8 to 1.25 by default). While you drag, the tabs' transitions are off, so the menu follows the pointer directly, and a ResizeObserver on the bar and every tab keeps the pill on its tab. The arrow keys resize it too, and Home and End jump to the ends. The tabs are a tablist: aria-selected marks the selected one, the arrow keys move and select, Home and End jump, and screen readers always hear each name. Reduced motion changes tabs without movement.",
  cardHeight: 260,
};
