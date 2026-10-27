import type { UiBlockMeta } from "@/lib/ui/types";

/** Surprise button, described for the site: the wall, the dialog and the registry. Plain data only. */
export const surpriseButtonMeta: UiBlockMeta = {
  id: "surprise-button",
  title: "Surprise button",
  description:
    "A text button that comes alive on hover: a colour band sweeps once through the label, then the text settles on ink with a small springy lift. It presses in on click.",
  category: "hover",
  name: "SurpriseButton",
  files: ["SurpriseButton.tsx", "SurpriseButton.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "size",
      label: "Size",
      options: [
        { value: "sm", label: "S" },
        { value: "md", label: "M" },
        { value: "lg", label: "L" },
      ],
      default: "md",
    },
    { type: "slider", prop: "speed", label: "Sweep", min: 300, max: 1600, step: 50, unit: "ms", default: 700 },
    { type: "toggle", prop: "lift", label: "Lift", default: true },
  ],
  howItWorks:
    "The label holds a copy of its own text, laid exactly over it and hidden from screen readers. The copy is filled with a gradient three times its width and clipped to the text (background-clip: text). Only the gradient's middle third is coloured: ink on its left edge, a five-colour band in the middle and clear on its right. At rest the copy is invisible. On hover it gets an animation that slides the gradient from right to left, so the text starts clear, the band passes through it once, and it ends on solid ink, matching the real text, which darkens underneath at the same time. Because the animation is only set while hovered, every new hover plays it from the start. The label also scales to 1.04 on a springy curve (Lift) and to 0.96 while pressed. Keyboard focus plays the same sweep. Reduced motion keeps only the colour change. The band's colours are --rk-surprise-band-1 to -5.",
  cardHeight: 240,
};
