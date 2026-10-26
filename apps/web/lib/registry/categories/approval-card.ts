import { ApprovalCardPreview } from "@/components/previews/beautiful-ui/previews";
import type { ComponentCategory } from "@/lib/registry/types";

export const approvalCard: ComponentCategory = {
  id: "approval-card",
  name: "Approval Card",
  group: "components",
  summary: "Human-in-the-loop questions the agent asks before acting.",
  items: [
    {
      id: "beautiful-ui-approval-card",
      title: "Approval Card",
      description: "Human-in-the-loop questions the agent asks before acting.",
      category: "approval-card",

      sourceName: "Beautiful UI",
      sourceUrl: "https://www.beautifului.dev/",
      instructionUrl: "https://www.beautifului.dev/r/approval-card.json",
      sourceLogo: "/sources/beautiful-ui.png",
      license: "MIT",
      attributionRequired: true,

      component: ApprovalCardPreview,

      replay: true,
      tags: ["ai", "form", "approval"],

      presets: [
        { id: "default", label: "Three", props: {} },
        {
          id: "single",
          label: "Single",
          props: {
            questions: [
              { q: "Ship the new flavor page?", type: "radio", options: ["Ship it", "Hold for review", "Send to design"] },
            ],
          },
        },
        {
          id: "multi",
          label: "Multi",
          props: {
            questions: [
              { q: "Which channels should announce it?", type: "check", options: ["Email", "In-app", "Storefront"] },
            ],
          },
        },
        {
          id: "quiet",
          label: "Quiet",
          props: {
            labels: { skip: "Not now", continue: "Next", send: "Submit" },
            resettable: false,
          },
        },
      ],

      code: {
        usage: `<ApprovalCard
  questions={questions}
  onSubmitted={(answers) => save(answers)}
/>`,
        props: [
          { name: "questions", type: "ApprovalQuestion[]", description: "Each with `q`, `type` (radio | check) and `options`." },
          { name: "labels", type: "Partial<ApprovalLabels>", description: "Skip / Continue / Send / placeholder / sent message." },
          { name: "onSubmitted", type: "(answers) => void", description: "Fires on the last question." },
          { name: "onAnswerChange", type: "(index, answer) => void", description: "Fires whenever a choice changes." },
        ],
        dependencies: ["react"],
        sourceIncluded: true,
        notes: [
          "Single-choice answers auto-advance after 480ms; multi-select waits for Continue. The step counter rolls like an odometer.",
          "Imports a Button and GlideMenu; this app supplies its own versions of both (see NOTICE.md).",
          "MIT source, included here with attribution. Upstream: npx shadcn@latest add https://www.beautifului.dev/r/approval-card.json",
        ],
      },
    },
  ],
};
