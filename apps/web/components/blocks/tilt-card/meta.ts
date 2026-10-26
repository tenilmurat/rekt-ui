import type { UiBlockMeta } from "@/lib/ui/types";

/**
 * Tilt card, described for the site: the wall, the dialog and the registry
 * (/r/tilt-card.json) all read this. Plain data only.
 */
export const tiltCardMeta: UiBlockMeta = {
  id: "tilt-card",
  title: "Tilt card",
  description:
    "A dark card that leans in 3D under your pointer while the Rekt mark catches an iridescent foil, with a glare and a shade that follow. Press it and it turns over to the logo on its back.",
  category: "hover",
  name: "TiltCard",
  files: ["TiltCard.tsx", "TiltCard.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "finish",
      label: "Finish",
      options: [
        { value: "holo", label: "Holo" },
        { value: "color", label: "Color" },
      ],
      default: "holo",
    },
    {
      type: "segmented",
      prop: "direction",
      label: "Direction",
      options: [
        { value: "lift", label: "Lift" },
        { value: "sink", label: "Sink" },
      ],
      default: "lift",
    },
    { type: "slider", prop: "tilt", label: "Tilt", min: 0, max: 25, step: 1, unit: "°", default: 12 },
    { type: "slider", prop: "shade", label: "Shade", min: 0, max: 100, step: 5, default: 50 },
    { type: "slider", prop: "corner", label: "Corner", min: 0, max: 40, step: 2, unit: "px", default: 24 },
    { type: "toggle", prop: "glare", label: "Glare", default: true },
  ],
  howItWorks:
    "Two layers do two jobs. The outer card takes the tilt: on pointer move it works out where the pointer sits (−0.5 to 0.5 on each axis) and turns that into rotateX and rotateY, inverted for Sink. Each frame the pose eases 14% of the way to that target, so fast movements stay smooth and leaving the card lets it settle back. The pose is written as CSS variables that every effect reads. On the plain near-black face, the Rekt mark is an SVG with its own foil: a spectrum gradient whose position follows the pointer, cut to the logo's shape by an SVG mask of the same path, so the colours slide across the mark as the card moves. The inner layer turns the card over: pressing it toggles rotateY(180deg) with a 700ms ease, and both faces hide their back side, so you only ever see the one facing you; the back carries only the logo. It acts as a button (focusable, announced as pressed or not, flipped with Enter or Space); it's a div rather than a <button> because browsers flatten 3D inside buttons. Reduced motion turns the tilt and the flip animation off.",
  cardHeight: 440,
};
