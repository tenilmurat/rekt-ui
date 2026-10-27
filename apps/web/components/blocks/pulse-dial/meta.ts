import type { UiBlockMeta } from "@/lib/ui/types";

/** Pulse dial, described for the site: the wall, the dialog and the registry. Plain data only. */
export const pulseDialMeta: UiBlockMeta = {
  id: "pulse-dial",
  title: "Pulse dial",
  description:
    "A round dial with the Rekt mark at its centre, ringed by thin circles, two slowly turning arcs and a crown of ticks. Click it and a cloud of fine dust bursts from the mark, swells into a ring as it crosses the dial and fades at the rim, while the mark gives a small pulse. Switch Auto on and it pulses by itself.",
  category: "press",
  name: "PulseDial",
  files: ["PulseDial.tsx", "PulseDial.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "tone",
      label: "Dust",
      options: [
        { value: "violet", label: "Violet" },
        { value: "ink", label: "Ink" },
      ],
      default: "violet",
    },
    { type: "slider", prop: "size", label: "Size", min: 160, max: 320, step: 8, unit: "px", default: 240 },
    { type: "slider", prop: "grains", label: "Grains", min: 400, max: 3600, step: 100, default: 1800 },
    { type: "slider", prop: "speed", label: "Speed", min: 600, max: 2600, step: 100, unit: "ms", default: 1400 },
    { type: "toggle", prop: "auto", label: "Auto", default: false },
  ],
  howItWorks:
    "The dial is a round button. Its rings are one SVG: four circles at different radii in two weights, two arcs made from circles with a dash pattern (pathLength=\"100\" makes the dash numbers percentages) that turn on CSS animations in opposite directions, 16s and 22s a lap, and 36 ticks on a 44-unit radius, the four cardinal ones a little longer. The mark is the Rekt logo path, 15% of the dial wide, and each click re-keys it so a 600ms keyframe pulse plays from the start. The dust lives on a canvas over the rings. A click makes a burst of Grains grains, each with a random angle, a start a little way out from the mark (bell-shaped, so most begin close in), a reach of 78–104% of the radius, a little sideways drift, its own size, opacity, delay and life. Every frame, each grain's distance eases out from start to reach, so the cloud leaves the mark fast and slows as it spreads; the spread in reach and life is what thickens it into a ring as it crosses the dial. A grain fades in over its first 8% and out over its last 45%, so the ring thins away at the rim instead of stopping, and a radial glow sits at the heart for the first third. Several bursts can fly at once, and the frame loop stops when none is left. Auto fires one every 2.6s. Reduced motion skips the dust and the pulse and holds the arcs still.",
  cardHeight: 380,
};
