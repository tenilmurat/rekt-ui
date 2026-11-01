import type { UiBlockMeta } from "@/lib/ui/types";

/** Bubble menu, described for the site: the wall, the dialog and the registry. Plain data only. */
export const bubbleMenuMeta: UiBlockMeta = {
  id: "bubble-menu",
  title: "Bubble menu",
  description:
    "A round button that opens a cluster of glass bubbles, where size is hierarchy: the main action gets the big bubble, the next the medium one, the rest small. They spring out of the button in turn, drift gently while open and fold back in when it closes, as the plus turns into a cross. Out of the box it's a create menu: New post, Photo, Voice and Link.",
  category: "navigation",
  name: "BubbleMenu",
  files: ["BubbleMenu.tsx", "BubbleMenu.css"],
  dependencies: ["lucide-react"],
  controls: [
    { type: "toggle", prop: "defaultOpen", label: "Start open", default: false },
    { type: "toggle", prop: "labels", label: "Label", default: true },
    { type: "toggle", prop: "float", label: "Float", default: true },
    { type: "toggle", prop: "closeOnSelect", label: "Close on select", default: true },
    { type: "slider", prop: "scale", label: "Size", min: 60, max: 140, step: 5, unit: "%", default: 100 },
  ],
  howItWorks:
    "The layout is the design's: an 84 px button and, above it, bubbles of 150, 87, 70 and 70 px plus a 24 px glass bead, each placed by its centre's offset from the button's centre. Items fill those slots in order, so the first item (the main action) gets the big bubble, the only one with a label, and the sizes read as the menu's hierarchy; the others show just their icon (their label is still their accessible name); the bead is decoration and hidden from screen readers. Every size is a multiple of --rk-bubble-u, one design px set from the Size prop, so the menu scales as a whole. Each bubble sits where it belongs when open; closed, a transform pulls it back onto the button's centre at 30% scale and it's faded and hidden. Opening drops the transform with a springy cubic-bezier, each bubble 45 ms after the one before, biggest first; closing is the same played backwards: the spring curve reversed (its control points mirrored, so each bubble swells out a touch before springing in), the same steps in the other order, each fading only as it lands. The glass is CSS: a radial gradient of the item's two tint colours lit from the top left, inset shadows for the rim and the darker bottom, a bright highlight across the top and a faint reflection low down, drawn with ::before and ::after. Each bubble drifts a few px on its own beat, using the translate property so it doesn't fight the hover scale, and keeps drifting while it closes so nothing jumps. The bead is a little marble: it circles its spot, swells and shrinks, and swirls its colours with a hue-rotate. The plus is the design's own: a filled cross, white at the centre fading to half at its ends, and it turns 45° into a cross with the same spring. It's a menu button: aria-expanded and aria-controls on the button, role=menu and menuitem on the bubbles, which are inert while closed; the arrow keys step through them, biggest first, Escape closes and returns focus to the button, and a press outside closes it. Reduced motion fades the bubbles in place, with no spring, spin or drift.",
  cardHeight: 420,
};
