import type { UiBlockMeta } from "@/lib/ui/types";

/** Icon burst, described for the site: the wall, the dialog and the registry. Plain data only. */
export const iconBurstMeta: UiBlockMeta = {
  id: "icon-burst",
  title: "Icon burst",
  description:
    "An icon that bursts into dust on hover: it breaks into a cloud of fine grains that drift outward and fade, then grows back from a point in the middle with a little spring.",
  category: "hover",
  name: "IconBurst",
  files: ["IconBurst.tsx", "IconBurst.css"],
  dependencies: ["lucide-react"],
  controls: [
    { type: "slider", prop: "size", label: "Size", min: 24, max: 72, step: 2, unit: "px", default: 40 },
    { type: "slider", prop: "spread", label: "Spread", min: 12, max: 70, step: 2, unit: "px", default: 34 },
    { type: "slider", prop: "grain", label: "Grain", min: 1, max: 3, step: 0.25, unit: "px", default: 1.25 },
    { type: "slider", prop: "speed", label: "Speed", min: 400, max: 1800, step: 50, unit: "ms", default: 900 },
  ],
  howItWorks:
    "When it mounts, the component draws its Lucide icon (Circle Check Big) on a hidden canvas: it serialises the SVG with its real colour, loads it as an image and reads the pixels back, keeping one point every Grain px wherever the stroke is solid. Those points are the dust. On hover (or focus, or click) the icon itself vanishes, scaled to a point, and each point becomes a 1px grain on a canvas laid over it, as big as the icon plus room for the Spread. Every grain drifts to a random spot in a soft disc round the icon (the Spread), leaning outward from where it started; a requestAnimationFrame loop eases each one there over its own slightly different life (Speed), holding most of its strength through the drift before it thins out, so the outline keeps its shape for a moment, then loosens into one even cloud of dust and fades. A little over halfway through, the icon grows back from the middle on a springy curve. A burst plays to the end before another can start, so hovering again replays it once it's back. The dust uses the icon's colour (--rk-burst-ink). Reduced motion skips the dust and fades the icon out and back.",
  cardHeight: 240,
};
