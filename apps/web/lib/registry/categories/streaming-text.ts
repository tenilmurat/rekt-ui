import { StreamingTextPreview } from "@/components/previews/beautiful-ui/previews";
import type { ComponentCategory } from "@/lib/registry/types";

export const streamingText: ComponentCategory = {
  id: "streaming-text",
  name: "Streaming Text",
  group: "components",
  summary: "Answers that arrive a word at a time.",
  items: [
    {
      id: "beautiful-ui-streaming-text",
      title: "Streaming Text",
      description: "Streamed answer with inline sources, actions, and follow-ups.",
      category: "streaming-text",

      sourceName: "Beautiful UI",
      sourceUrl: "https://www.beautifului.dev/",
      instructionUrl: "https://www.beautifului.dev/r/streaming-text.json",
      sourceLogo: "/sources/beautiful-ui.png",
      license: "MIT",
      attributionRequired: true,

      component: StreamingTextPreview,

      replay: true,
      tags: ["ai", "text", "citations"],

      presets: [
        { id: "loop", label: "Loop", props: { loop: true } },
        { id: "once", label: "Once", props: { loop: false } },
        { id: "wide", label: "Wide", props: { loop: true, fill: true } },
        {
          id: "short",
          label: "Short",
          props: {
            loop: true,
            content: "Vanilla still outsells every other flavor on weekdays.".split(" ").map((text) => ({ text })),
            followUps: ["Show the weekday split"],
          },
        },
      ],

      code: {
        usage: `<StreamingText
  content={tokens}
  sources={sources}
  followUps={["Which flavors sell best in winter"]}
  loop
/>`,
        props: [
          { name: "content", type: "StreamingToken[]", description: "Words to stream; a `cite` token renders a source chip." },
          { name: "sources", type: "StreamingSource[]", description: "Cited sources for the chip, stack and list." },
          { name: "followUps", type: "string[]", description: "Suggestions shown once the stream finishes." },
          { name: "loop", type: "boolean", description: "Restart after a hold; off inside a real thread." },
          { name: "fill", type: "boolean", description: "Fill the parent instead of a fixed measure." },
        ],
        dependencies: ["react"],
        sourceIncluded: true,
        notes: [
          "One word every 55ms, then a 3.4s hold; citation chips pop in at 250ms and follow-ups fade up 90ms apart.",
          "MIT source, included here with attribution. Upstream: npx shadcn@latest add https://www.beautifului.dev/r/streaming-text.json",
        ],
      },
    },
  ],
};
