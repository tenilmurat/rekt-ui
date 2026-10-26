import { LoadingStatePreview } from "@/components/previews/beautiful-ui/previews";
import type { ComponentCategory } from "@/lib/registry/types";

const BEAUTIFUL_UI = {
  sourceName: "Beautiful UI",
  sourceUrl: "https://www.beautifului.dev/",
  instructionUrl: "https://www.beautifului.dev/r/loading-state.json",
  sourceLogo: "/sources/beautiful-ui.png",
  license: "MIT",
  attributionRequired: true,
} as const;

export const loadingState: ComponentCategory = {
  id: "loading-state",
  name: "Loading State",
  group: "components",
  summary: "Loaders that tell the user something is still happening.",
  items: [
    {
      id: "beautiful-ui-pixel-loader",
      title: "Loading State",
      description: "Pixel-grid loader with shimmer and elapsed time.",
      category: "loading-state",
      ...BEAUTIFUL_UI,

      component: LoadingStatePreview,
      tags: ["loader", "ai", "status"],

      presets: [
        { id: "drive", label: "Drive", props: { variant: "Drive" } },
        { id: "dots", label: "Dots", props: { variant: "Dots" } },
        { id: "orbit", label: "Orbit", props: { variant: "Orbit" } },
        { id: "surfer", label: "Surfer", props: { variant: "Surfer" } },
      ],

      code: {
        usage: `<LoadingState variant="Drive" label="Churning" />`,
        props: [
          { name: "variant", type: `"Drive" | "Dots" | "Orbit" | "Surfer"`, description: "Cell pattern and rhythm." },
          { name: "label", type: "string", description: "Shimmering status text." },
          { name: "videoSrc", type: "string", description: "Clip shown by the Surfer variant." },
        ],
        dependencies: ["react"],
        sourceIncluded: true,
        notes: [
          "Cells pulse 0.15 → 1 → 0.15 over 650ms with a 0/90/180ms column stagger; Orbit walks the perimeter over 950ms.",
          "MIT source, included here with attribution. Upstream: npx shadcn@latest add https://www.beautifului.dev/r/loading-state.json",
        ],
      },
    },

  ],
};
