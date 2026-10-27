import type { UiBlockMeta } from "@/lib/ui/types";

/** Morph loader, described for the site: the wall, the dialog and the registry. Plain data only. */
export const morphLoaderMeta: UiBlockMeta = {
  id: "morph-loader",
  title: "Morph loader",
  description:
    "A loading mark that never sits still: one soft shape turns while it morphs from circle to oval, triangle, square, pentagon, petals and clover, and its two-tone gradient walks along a colour ramp, one colour per shape.",
  category: "loading",
  name: "MorphLoader",
  files: ["MorphLoader.tsx", "MorphLoader.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "palette",
      label: "Colours",
      options: [
        { value: "spectrum", label: "Spectrum" },
        { value: "sunset", label: "Sunset" },
        { value: "lagoon", label: "Lagoon" },
      ],
      default: "spectrum",
    },
    { type: "slider", prop: "size", label: "Size", min: 24, max: 120, step: 4, unit: "px", default: 56 },
    { type: "slider", prop: "speed", label: "Speed", min: 400, max: 1600, step: 50, unit: "ms", default: 800 },
  ],
  howItWorks:
    "Every shape is stored the same way: a radius for each of 144 angles round the centre. A circle is all ones, the petals are a cosine wave, the oval is the ellipse's polar form, and the triangle, square, pentagon and clover are sharp shapes softened by averaging each radius with its neighbours. Each one is scaled to the same area, so none looks bigger than the others, and turned so its corners line up as closely as they can with the shape before it, so every morph travels the shortest way. The order counts up (two sides, three, four, five, eight petals) and the four-lobed clover eases back into the circle. Because they share angles, any two morph by blending their radii, and a requestAnimationFrame loop does that once per step: it's always on its way to the next shape, with no hold: each step (Speed) blends on a curve that's half linear and half sine, soft through each shape but never quite still, and writes the outline to an SVG path. The shape turns steadily, with a gentle extra eighth of a turn eased through each morph. The fill is a two-colour linear gradient that turns a little faster than the shape, so the colours visibly flow even on the circle, where a turn alone can't be seen; both colours drift at a constant pace one place along the palette per step, walking up the ramp and back down rather than wrapping round, so it only ever blends neighbours and never passes through grey. A fixed white radial sheen on top gives it a little body. It's a role=\"status\" with a visually hidden label for screen readers, and reduced motion shows the first shape, still.",
  cardHeight: 260,
};
