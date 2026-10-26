import { OrbitPreview } from "@/components/previews/rareui/previews";
import type { ComponentCategory } from "@/lib/registry/types";

export const loader: ComponentCategory = {
  id: "loader",
  name: "Loader",
  group: "components",
  summary: "Motion for short waits.",
  items: [
    {
      id: "rare-ui-orbit",
      title: "Orbit",
      description: "A dot on a circular path, eased in by a spring.",
      category: "loader",

      sourceName: "Rare UI",
      sourceUrl: "https://www.rareui.com/",
      instructionUrl: "https://www.rareui.com/components",
      sourceLogo: "/sources/rare-ui.svg",
      license: "MIT",
      attributionRequired: true,

      component: OrbitPreview,
      tags: ["loader", "motion", "orbit"],

      presets: [
        { id: "steady", label: "Steady", props: { radius: 96, speed: 0.4, size: 16 } },
        { id: "slow", label: "Slow", props: { radius: 120, speed: 0.18, size: 12 } },
        { id: "quick", label: "Quick", props: { radius: 72, speed: 0.9, size: 14 } },
        { id: "bare", label: "No path", props: { radius: 96, speed: 0.4, size: 16, showPath: false } },
      ],

      code: {
        usage: `<Orbit radius={120} speed={0.4} />`,
        props: [
          { name: "radius", type: "number", description: "Distance from the centre, in px. Default 120." },
          { name: "speed", type: "number", description: "Turns per second. Default 1." },
          { name: "size", type: "number", description: "Diameter of the dot, in px. Default 16." },
          { name: "paused", type: "boolean", description: "Freezes the orbit; this library sets it when the preview is off-screen." },
        ],
        dependencies: ["react", "motion"],
        sourceIncluded: true,
        notes: [
          "A frame loop advances a target angle and a spring (stiffness 80, damping 20) follows it, so the dot eases up to speed rather than snapping into it.",
          "The dashed ring and centre mark belong to this preview, not to the component — Orbit renders only the travelling dot, coloured by `currentColor`.",
          "The published snippet did not run: it imported `animated` from motion/react (that is React Spring's API), read the motion value during render, and never advanced the angle. All three are fixed here and recorded in NOTICE.md.",
          "MIT source, included with attribution. Rare UI's catalogue does not list an Orbit component today, so the link points at the library rather than a component page.",
        ],
      },
    },
  ],
};
