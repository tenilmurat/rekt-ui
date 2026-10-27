import type { UiBlockMeta } from "@/lib/ui/types";

/** Icon burst, described for the site: the wall, the dialog and the registry. Plain data only. */
export const iconBurstMeta: UiBlockMeta = {
  id: "icon-burst",
  title: "Icon burst",
  description:
    "An icon with a small \"Click me\" under it that bursts into dust when you click it: it breaks into a dense cloud of fine grains that fly out, glide to a stop and fade away gently, then the icon grows back from a point in the middle with a little spring. The dust can be colourful or the icon's own black.",
  category: "press",
  name: "IconBurst",
  files: ["IconBurst.tsx", "IconBurst.css"],
  dependencies: ["lucide-react"],
  controls: [
    {
      type: "icons",
      prop: "icon",
      label: "Icon",
      options: [
        { value: "circle-check-big", label: "Check" },
        { value: "heart", label: "Heart" },
        { value: "star", label: "Star" },
        { value: "thumbs-up", label: "Thumbs up" },
        { value: "bell", label: "Bell" },
        { value: "bookmark", label: "Bookmark" },
        { value: "zap", label: "Zap" },
        { value: "flame", label: "Flame" },
        { value: "rocket", label: "Rocket" },
        { value: "gift", label: "Gift" },
        { value: "trophy", label: "Trophy" },
        { value: "smile", label: "Smile" },
      ],
      default: "circle-check-big",
    },
    { type: "toggle", prop: "colorful", label: "Colourful dust", default: true },
    { type: "slider", prop: "size", label: "Size", min: 24, max: 72, step: 2, unit: "px", default: 40 },
    { type: "slider", prop: "spread", label: "Spread", min: 16, max: 80, step: 2, unit: "px", default: 44 },
    { type: "slider", prop: "grain", label: "Grain", min: 0.75, max: 3, step: 0.25, unit: "px", default: 1 },
    { type: "slider", prop: "speed", label: "Speed", min: 600, max: 3000, step: 100, unit: "ms", default: 1600 },
  ],
  howItWorks:
    "When it mounts, and whenever the icon, Size or Grain changes, the component draws its Lucide icon on a hidden canvas: it serialises the SVG, loads it as an image and reads the pixels back, keeping a point every Grain px wherever the stroke is solid. On click (or Enter / Space) the icon vanishes, scaled to a point, and every point becomes two grains of dust, one a hair off the other, on a canvas laid over it with room for the Spread. Each grain flies to a random spot in a soft disc round the icon, leaning outward from where it started, on an ease that's fast off the mark and then a long glide; it keeps its full strength through the burst and fades out slowly over the rest of its own slightly different life (Speed), so the cloud thins away gently instead of vanishing. A little over halfway, the icon grows back from the middle on a springy curve, and you can burst it again while the last dust is still fading. With Colourful dust on, colours are handed out round the icon like a wheel, a little loosely, from a warm-to-cool ramp (coral, pink, orange, yellow, lime, green, teal), so neighbouring grains match; off, the dust is the icon's own colour (--rk-burst-ink, black by default). A small hint line sits under the icon (hint, \"Click me\" by default; empty hides it). Pick any of the twelve built-in icons by name, or pass any Lucide icon component as icon. Reduced motion skips the dust and fades the icon out and back.",
  cardHeight: 260,
};
