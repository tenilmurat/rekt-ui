import { ThinkingStatePreview } from "@/components/previews/beautiful-ui/previews";
import type { ComponentCategory } from "@/lib/registry/types";

export const thinking: ComponentCategory = {
  id: "thinking",
  name: "Thinking",
  group: "components",
  summary: "Reasoning traces that expand while an agent works.",
  items: [
    {
      id: "beautiful-ui-thinking",
      title: "Thinking",
      description: "Expandable traces — steps, reasoning, search, coding.",
      category: "thinking",

      sourceName: "Beautiful UI",
      sourceUrl: "https://www.beautifului.dev/",
      instructionUrl: "https://www.beautifului.dev/r/thinking-state.json",
      sourceLogo: "/sources/beautiful-ui.png",
      license: "MIT",
      attributionRequired: true,

      component: ThinkingStatePreview,

      replay: true,
      tags: ["ai", "status", "trace"],

      presets: [
        { id: "steps", label: "Steps", props: { variant: "Steps" } },
        { id: "reasoning", label: "Reasoning", props: { variant: "Reasoning" } },
        { id: "search", label: "Search", props: { variant: "Search" } },
        { id: "coding", label: "Coding", props: { variant: "Coding" } },
      ],

      code: {
        usage: `<ThinkingState variant="Steps" onSettled={() => {}} />`,
        props: [
          { name: "variant", type: `"Steps" | "Reasoning" | "Search" | "Coding"`, description: "Which trace to play." },
          { name: "rows", type: "Row[]", description: "Override the trace content." },
          { name: "active / done", type: "string", description: "Status label while working, and once settled." },
          { name: "onSettled", type: "() => void", description: "Fires when the trace finishes." },
        ],
        dependencies: ["react"],
        sourceIncluded: true,
        notes: [
          "Stages run 800/600/1800/2600/1600ms; rows fade up 320ms at 120ms intervals; the header stays expandable after it settles.",
          "MIT source, included here with attribution. Upstream: npx shadcn@latest add https://www.beautifului.dev/r/thinking-state.json",
        ],
      },
    },
  ],
};
