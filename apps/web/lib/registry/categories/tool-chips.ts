import { ToolChipsPreview } from "@/components/previews/beautiful-ui/previews";
import type { ComponentCategory } from "@/lib/registry/types";

export const toolChips: ComponentCategory = {
  id: "tool-chips",
  name: "Tool Chips",
  group: "components",
  summary: "Code edits and tool calls as compact chips.",
  items: [
    {
      id: "beautiful-ui-tool-chips",
      title: "Tool Chips",
      description: "Code edits and tool calls as compact chips.",
      category: "tool-chips",

      sourceName: "Beautiful UI",
      sourceUrl: "https://www.beautifului.dev/",
      instructionUrl: "https://www.beautifului.dev/r/tool-chips.json",
      sourceLogo: "/sources/beautiful-ui.png",
      license: "MIT",
      attributionRequired: true,

      component: ToolChipsPreview,

      replay: true,
      tags: ["ai", "code", "trace"],

      presets: [
        { id: "run", label: "Run", props: {} },
        {
          id: "short",
          label: "Short",
          props: {
            labels: { header: "2 tool calls, 1 message", more: "+1 more" },
            steps: [
              {
                icon: "write", label: "Write 64 lines", chip: "MenuBoard.tsx", mono: true, detailMono: true,
                detail: [{ text: "+ const board = buildBoard(flavors)", tone: "add" }],
              },
              {
                icon: "run", label: "Rebuild", chip: "npm run build", mono: true, detailMono: true,
                detail: [{ text: "✓ built in 0.8s" }],
              },
            ],
            diffs: [{ file: "MenuBoard.tsx", add: 64, del: 3 }],
          },
        },
        {
          id: "reading",
          label: "Reading",
          props: {
            labels: { header: "3 tool calls, 1 message", more: "+4 more" },
            steps: [
              {
                icon: "read", label: "Read file", chip: "flavors.ts", mono: true, detailMono: false,
                detail: [{ text: "42 flavors, 6 seasonal." }],
              },
              {
                icon: "think", label: "Thinking", chip: "Ranking by margin…", mono: false, detailMono: false,
                detail: [{ text: "Pistachio leads on margin, vanilla on volume." }],
              },
              {
                icon: "read", label: "Read image", chip: "summer-chart.png", mono: true, detailMono: false,
                detail: [{ text: "Line chart, three summers." }],
              },
            ],
          },
        },
      ],

      code: {
        usage: `<ToolChips
  steps={steps}
  diffs={[{ file: "menu.ts", add: 8, del: 2 }]}
/>`,
        props: [
          { name: "steps", type: "ToolStep[]", description: "Tool calls: icon, label, chip and detail lines." },
          { name: "diffs", type: "ToolDiff[]", description: "File chips with added/removed counts." },
          { name: "diffLines", type: "Record<string, ToolDiffLine[]>", description: "Diff preview shown on hover." },
          { name: "labels", type: "Partial<ToolChipsLabels>", description: "Header and overflow copy." },
        ],
        dependencies: ["react", "react-dom"],
        sourceIncluded: true,
        notes: [
          "Rows appear every 700ms; diff chips pop in 80ms apart; hovering a file chip opens its diff in a portal.",
          "MIT source, included here with attribution. Upstream: npx shadcn@latest add https://www.beautifului.dev/r/tool-chips.json",
        ],
      },
    },
  ],
};
