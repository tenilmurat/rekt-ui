import type { UiBlockMeta } from "@/lib/ui/types";

/** Morph loader, described for the site: the wall, the dialog and the registry. Plain data only. */
export const morphLoaderMeta: UiBlockMeta = {
  id: "morph-loader",
  title: "Morph loader",
  description:
    "A loading mark that never sits still: one soft shape turns while it morphs from circle to oval, petals, pentagon, clover and cookie, and its two-tone gradient walks along a colour ramp, one colour per shape.",
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
    { type: "slider", prop: "speed", label: "Speed", min: 500, max: 2000, step: 50, unit: "ms", default: 1000 },
  ],
  howItWorks:
    "Every shape is stored the same way: a radius for each of 144 angles round the centre. A circle is all ones, the petals and the cookie are cosine waves, the oval is the ellipse's polar form, and the pentagon and clover are sharp shapes softened by averaging each radius with its neighbours. Each one is scaled to the same area, so none looks bigger than the others. Because they share angles, any two morph by blending their radii, and a requestAnimationFrame loop does that once per step: it holds a shape for a third of the step (Speed), then blends to the next on an ease-in-out and writes the outline to an SVG path. The shape turns steadily and takes an extra quarter turn through each morph, so it speeds up as it changes. The fill is a two-colour linear gradient that turns with the shape; with every step both colours slide one place along the palette, walking up the ramp and back down rather than wrapping round, so it only ever blends neighbours and never passes through grey. A fixed white radial sheen on top gives it a little body. It's a role=\"status\" with a visually hidden label for screen readers, and reduced motion shows the first shape, still.",
  cardHeight: 260,
};
