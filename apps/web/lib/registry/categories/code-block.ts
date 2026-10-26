import { CodeBlockPreview } from "@/components/previews/rareui/previews";
import type { ComponentCategory } from "@/lib/registry/types";

export const codeBlock: ComponentCategory = {
  id: "code-block",
  name: "Code Block",
  group: "components",
  summary: "Syntax-highlighted code, ready to copy.",
  items: [
    {
      id: "rare-ui-code-block",
      title: "Code Block",
      description: "Syntax-highlighted code with line numbers and a copy button; the whole theme is built from one accent colour.",
      category: "code-block",

      sourceName: "Rare UI",
      sourceUrl: "https://www.rareui.com/components/code-block",
      instructionUrl: "https://www.rareui.com/components/code-block",
      sourceLogo: "/sources/rare-ui.svg",
      license: "MIT",
      attributionRequired: true,

      component: CodeBlockPreview,
      surface: "bare", // it already has a frame of its own
      tags: ["code", "copy", "syntax"],

      presets: [
        { id: "rare", label: "Rare", props: { accent: "#F75001" } },
        { id: "blue", label: "Blue", props: { accent: "#2563EB" } },
        { id: "red", label: "Red", props: { accent: "#EF4444" } },
        { id: "green", label: "Green", props: { accent: "#22C55E" } },
      ],

      code: {
        usage: `<CodeBlock
  code={source}
  language="tsx"
  filename="orbit.tsx"
  accent="#F75001"
/>`,
        props: [
          { name: "code", type: "string", description: "The source to render." },
          { name: "language", type: "string", description: "Prism language id — tsx, css, json, bash…" },
          { name: "accent", type: "string", description: "Any hex; the gutter, border, selection and highlight wash are derived from it." },
          { name: "mode", type: `"auto" | "dark" | "light"`, description: "`auto` follows the page theme, which is how the library uses it." },
          { name: "filename", type: "string", description: "Shown in the header; falls back to the language id." },
          { name: "showFrame / showHeader / showLineNumbers / showCopyButton", type: "boolean", description: "Each part of the chrome can be turned off." },
          { name: "highlightLines", type: "number[]", description: "1-based lines to wash with the accent." },
        ],
        dependencies: ["react", "motion", "prism-react-renderer", "lucide-react", "clsx", "tailwind-merge"],
        sourceIncluded: true,
        notes: [
          "Copy is real: the button writes to the clipboard and swaps to a check for 1.8s. Try it on the preview.",
          "`mode=\"auto\"` watches the <html> class, so the block follows this site's light/dark toggle without any wiring.",
          "MIT source, taken from their shadcn registry and included with attribution. Upstream: npx shadcn@latest add https://www.rareui.com/r/code-block.json",
        ],
      },
    },
  ],
};
