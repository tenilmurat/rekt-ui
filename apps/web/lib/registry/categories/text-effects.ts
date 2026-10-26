import {
  ScrambleHoverPreview,
  ScrambleInPreview,
  TextRotatePreview,
  TypewriterPreview,
} from "@/components/previews/fancy/previews";
import { ShimmerTextPreview } from "@/components/previews/kokonut/previews";
import type { ComponentCategory, ComponentItem } from "@/lib/registry/types";

/** Shared attribution for the Fancy Components text set (MIT). */
const fancy = (slug: string): Pick<
  ComponentItem,
  "sourceName" | "sourceUrl" | "instructionUrl" | "sourceLogo" | "license" | "attributionRequired"
> => ({
  sourceName: "Fancy Components",
  sourceUrl: `https://www.fancycomponents.dev/docs/components/text/${slug}`,
  instructionUrl: `https://www.fancycomponents.dev/docs/components/text/${slug}`,
  sourceLogo: "/sources/fancy-components.png",
  license: "MIT",
  attributionRequired: true,
});

const upstream = (slug: string) =>
  `MIT source, included with attribution. Upstream: npx shadcn@latest add https://fancycomponents.dev/r/${slug}.json`;

export const textEffects: ComponentCategory = {
  id: "text-effects",
  name: "Text Effects",
  group: "components",
  summary: "Rotating, typing and scrambling text.",
  items: [
    {
      id: "fancy-text-rotate",
      title: "Text Rotate",
      description: "Switches the rendered text through a list, one character at a time.",
      category: "text-effects",
      ...fancy("text-rotate"),
      component: TextRotatePreview,
      tags: ["text", "motion", "loop"],
      presets: [
        { id: "last", label: "Last", props: { staggerFrom: "last" } },
        { id: "first", label: "First", props: { staggerFrom: "first" } },
        { id: "center", label: "Center", props: { staggerFrom: "center" } },
        { id: "random", label: "Random", props: { staggerFrom: "random", staggerDuration: 0.04 } },
      ],
      code: {
        usage: `<TextRotate
  texts={["work!", "fancy ✽", "right", "fast"]}
  mainClassName="text-white px-3 bg-[#ff5941] rounded-lg"
  staggerFrom="last"
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "-120%" }}
  staggerDuration={0.025}
  transition={{ type: "spring", damping: 30, stiffness: 400 }}
  rotationInterval={2000}
/>`,
        props: [
          { name: "texts", type: "string[]", description: "The list it rotates through." },
          { name: "rotationInterval", type: "number", description: "Milliseconds each text holds. Default 2000." },
          { name: "staggerFrom", type: `"first" | "last" | "center" | "random" | number`, description: "Where the per-character stagger starts." },
          { name: "staggerDuration", type: "number", description: "Seconds between characters." },
          { name: "splitBy", type: `"words" | "characters" | "lines" | string`, description: "How the text is split before animating." },
          { name: "initial / animate / exit", type: "MotionProps", description: "Per-character motion; accepts one value or an array." },
          { name: "loop / auto", type: "boolean", description: "Keep cycling, and start on mount. Both default true." },
          { name: "mainClassName / splitLevelClassName / elementLevelClassName", type: "string", description: "Classes for the chip, the line wrapper and each character." },
        ],
        dependencies: ["react", "motion"],
        sourceIncluded: true,
        notes: [
          "Wrap it in a LayoutGroup with a `layout` sibling — as their demo does — so the words before it slide as the chip resizes.",
          "The #ff5941 chip is from their demo, kept here so the entry matches the docs.",
          upstream("text-rotate"),
        ],
      },
    },

    {
      id: "fancy-typewriter",
      title: "Typewriter",
      description: "Types a list of phrases out one letter at a time, then deletes them.",
      category: "text-effects",
      ...fancy("typewriter"),
      component: TypewriterPreview,
      tags: ["text", "typing", "loop"],
      presets: [
        { id: "default", label: "Default", props: {} },
        { id: "fast", label: "Fast", props: { speed: 28, deleteSpeed: 18, waitTime: 900 } },
        { id: "slow", label: "Slow", props: { speed: 130, deleteSpeed: 70, waitTime: 2200 } },
        { id: "bar", label: "Block", props: { cursorChar: "▍", cursorClassName: "text-yellow-500" } },
      ],
      code: {
        usage: `<Typewriter
  text={["experience", "dance", "love", "be alive"]}
  speed={70}
  waitTime={1500}
  deleteSpeed={40}
  cursorChar="_"
  className="text-yellow-500"
/>`,
        props: [
          { name: "text", type: "string | string[]", description: "One phrase, or a list it cycles through." },
          { name: "speed", type: "number", description: "Milliseconds per character typed. Default 50." },
          { name: "deleteSpeed", type: "number", description: "Milliseconds per character deleted." },
          { name: "waitTime", type: "number", description: "Pause on a finished phrase before deleting." },
          { name: "initialDelay", type: "number", description: "Delay before the first character." },
          { name: "cursorChar", type: "string | ReactNode", description: "What the caret is drawn with." },
          { name: "showCursor / hideCursorOnType", type: "boolean", description: "Draw the caret; optionally hide it while typing." },
          { name: "as", type: "ElementType", description: "Element to render. Default span." },
        ],
        dependencies: ["react", "motion"],
        sourceIncluded: true,
        notes: [
          "Give the surrounding paragraph `whitespace-pre-wrap` so trailing spaces survive, as in their demo.",
          upstream("typewriter"),
        ],
      },
    },

    {
      id: "fancy-scramble-hover",
      title: "Scramble Hover",
      description: "Scrambles a line of text while the pointer is over it. Hover a row.",
      category: "text-effects",
      ...fancy("scramble-hover"),
      component: ScrambleHoverPreview,
      tags: ["text", "hover", "scramble"],
      presets: [
        { id: "original", label: "Original", props: { useOriginalCharsOnly: true } },
        { id: "symbols", label: "Symbols", props: { useOriginalCharsOnly: false } },
        { id: "sequential", label: "Sequential", props: { useOriginalCharsOnly: false, sequential: true, revealDirection: "start" } },
        { id: "center", label: "From centre", props: { useOriginalCharsOnly: false, sequential: true, revealDirection: "center" } },
      ],
      code: {
        usage: `<ScrambleHover
  text="Llama 3.1 405B Instruct Turbo"
  scrambleSpeed={50}
  maxIterations={8}
  useOriginalCharsOnly
  className="cursor-pointer"
/>`,
        props: [
          { name: "text", type: "string", description: "The line to scramble." },
          { name: "scrambleSpeed", type: "number", description: "Milliseconds between scramble frames." },
          { name: "maxIterations", type: "number", description: "Frames before it settles." },
          { name: "sequential", type: "boolean", description: "Reveal letter by letter instead of all at once." },
          { name: "revealDirection", type: `"start" | "end" | "center"`, description: "Where a sequential reveal starts." },
          { name: "useOriginalCharsOnly", type: "boolean", description: "Shuffle the line's own characters rather than random symbols." },
          { name: "characters", type: "string", description: "The pool used when it isn't restricted to the original characters." },
          { name: "scrambledClassName", type: "string", description: "Class applied to characters that are still scrambling." },
        ],
        dependencies: ["react", "motion"],
        sourceIncluded: true,
        notes: [
          "This one is pointer-driven: nothing moves until you hover a row.",
          upstream("scramble-hover"),
        ],
      },
    },

    {
      id: "fancy-scramble-in",
      title: "Scramble In",
      description: "Reveals text with a scrambled edge running ahead of it.",
      category: "text-effects",
      ...fancy("scramble-in"),
      component: ScrambleInPreview,
      replay: true,
      tags: ["text", "reveal", "scramble"],
      presets: [
        { id: "default", label: "Default", props: { scrambleSpeed: 25, scrambledLetterCount: 5 } },
        { id: "fast", label: "Fast", props: { scrambleSpeed: 12, scrambledLetterCount: 5 } },
        { id: "wide", label: "Wide", props: { scrambleSpeed: 25, scrambledLetterCount: 12 } },
        { id: "slow", label: "Slow", props: { scrambleSpeed: 55, scrambledLetterCount: 3 } },
      ],
      code: {
        usage: `const ref = useRef<ScrambleInHandle>(null)

<ScrambleIn
  ref={ref}
  text="1. One More Time (featuring Romanthony) - 5:20"
  scrambleSpeed={25}
  scrambledLetterCount={5}
  autoStart={false}
/>

// stagger a list
useEffect(() => {
  titles.forEach((_, i) => setTimeout(() => refs.current[i]?.start(), i * 50))
}, [])`,
        props: [
          { name: "text", type: "string", description: "The line to reveal." },
          { name: "scrambleSpeed", type: "number", description: "Milliseconds between frames." },
          { name: "scrambledLetterCount", type: "number", description: "How many scrambled characters run ahead of the reveal." },
          { name: "autoStart", type: "boolean", description: "Start on mount; set false and drive it through the ref." },
          { name: "onStart / onComplete", type: "() => void", description: "Fire at each end of the reveal." },
          { name: "characters", type: "string", description: "The scramble pool." },
          { name: "scrambledClassName", type: "string", description: "Class for the scrambled edge." },
        ],
        dependencies: ["react"],
        sourceIncluded: true,
        notes: [
          "Exposes a `ScrambleInHandle` with `start()` and `reset()`; the list here staggers them 50ms apart, the way their demo does.",
          "The only one of the four with no motion dependency.",
          upstream("scramble-in"),
        ],
      },
    },

    {
      id: "kokonut-shimmer-text",
      title: "Shimmer Text",
      description: "A gradient that sweeps across the letters, on a loop.",
      category: "text-effects",

      sourceName: "Kokonut UI",
      sourceUrl: "https://kokonutui.com/docs/components/shimmer-text",
      instructionUrl: "https://kokonutui.com/docs/components/shimmer-text",
      sourceLogo: "/sources/kokonut-ui.png",
      license: "MIT",
      attributionRequired: true,

      component: ShimmerTextPreview,
      tags: ["text", "gradient", "loop"],

      presets: [
        { id: "slow", label: "Slow", props: { duration: 4.2 } },
        { id: "normal", label: "Normal", props: { duration: 2.5 } },
        { id: "fast", label: "Fast", props: { duration: 1.2 } },
      ],

      code: {
        usage: `<ShimmerText text="Text Shimmer" duration={2.5} />`,
        props: [
          { name: "text", type: "string", description: "What shimmers." },
          { name: "duration", type: "number", description: "Seconds for one pass. Upstream is a fixed 2.5; this library added the prop." },
          { name: "className", type: "string", description: "Merged with the gradient classes through `cn`, so size and weight can be overridden." },
        ],
        dependencies: ["react", "motion"],
        sourceIncluded: true,
        notes: [
          "The sweep is a 200% wide gradient whose background-position runs from 200% to -200%, clipped to the text — so it loops without a seam.",
          "It lifts in once on mount (20px, 0.5s) and then shimmers forever; the colours come from the neutral scale and flip with the site's dark mode.",
          "MIT source, included with attribution. Upstream: npx shadcn@latest add https://kokonutui.com/r/shimmer-text.json",
        ],
      },
    },
  ],
};
