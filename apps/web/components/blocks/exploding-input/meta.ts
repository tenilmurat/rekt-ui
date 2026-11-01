import type { UiBlockMeta } from "@/lib/ui/types";

/** Exploding input, described for the site: the wall, the dialog and the registry. Plain data only. */
export const explodingInputMeta: UiBlockMeta = {
  id: "exploding-input",
  title: "Exploding input",
  description:
    "An underlined text input that bursts as you type: every character sends a few emoji, or colourful copies of the letter you just typed, flying out of the caret. They spin, arc down under gravity and fade, and they're free to leave the input and fly over the page. Choose which way they go: up and to the left, straight up, up and to the right, spilling down, or scattered all round.",
  category: "type",
  name: "ExplodingInput",
  files: ["ExplodingInput.tsx", "ExplodingInput.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "direction",
      label: "Direction",
      options: [
        { value: "up-left", label: "↖" },
        { value: "up", label: "↑" },
        { value: "up-right", label: "↗" },
        { value: "down", label: "↓" },
        { value: "all", label: "All" },
      ],
      default: "up",
    },
    {
      type: "segmented",
      prop: "particles",
      label: "Particles",
      options: [
        { value: "emoji", label: "Emoji" },
        { value: "letters", label: "Letters" },
      ],
      default: "emoji",
    },
    { type: "slider", prop: "count", label: "Count", min: 1, max: 8, step: 1, default: 3 },
    { type: "slider", prop: "gravity", label: "Gravity", min: 0, max: 1.5, step: 0.1, default: 0.6 },
    { type: "slider", prop: "size", label: "Size", min: 16, max: 56, step: 2, unit: "px", default: 32 },
  ],
  howItWorks:
    "It's a plain <input> (every input prop passes through), underlined, with a layer the component adds to <body> on mount: fixed over the whole page, pointer-events off, so the bits can leave the input and its card. On each input event that inserts text, it finds the caret on screen: the input's left edge and padding, plus the width of the text before the caret measured on a canvas in the input's own font, less how far the input has scrolled. For each character typed (the first six, for a paste) it adds count spans at that point: an emoji picked at random from emojis, or with particles set to letters, the character itself in the input's font and one of seven bright colours (spaces send nothing). Each gets a speed of 420–680 px/s (slower spilling down) at an angle around the chosen direction: about 125° up and left, straight up, 55° up and right, down, each with 20–35° of scatter, or any angle at all for All; plus a random spin and a size of 75–125%. One requestAnimationFrame loop, running only while bits are alive, moves them with simple physics: gravity × 1800 px/s² pulls them down, so they arc, and position, spin and scale are written straight to each span's transform, with no React render. Each pops in from small over a tenth of a second and fades over the last 0.45 s of its 1.6 s life, then is removed; past 160 at once the oldest go first. Reduced motion types without the bursts.",
  cardHeight: 260,
  source: { name: "Spell UI, Exploding Input", url: "https://spell.sh/docs/exploding-input" },
};
