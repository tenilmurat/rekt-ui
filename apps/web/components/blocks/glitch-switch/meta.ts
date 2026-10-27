import type { UiBlockMeta } from "@/lib/ui/types";

/** Glitch switch, described for the site: the wall, the dialog and the registry. Plain data only. */
export const glitchSwitchMeta: UiBlockMeta = {
  id: "glitch-switch",
  title: "Glitch switch",
  description:
    "A square button with its corners picked out in brackets that switches state with a glitch: click it and it breaks into horizontal slices that tear sideways for a few stuttered frames, the old and the new label torn over each other with soft colour fringes, then it snaps clean onto the next state, in its own colour. A small \"Click me\" sits under it.",
  category: "press",
  name: "GlitchSwitch",
  files: ["GlitchSwitch.tsx", "GlitchSwitch.css"],
  dependencies: [],
  controls: [
    { type: "slider", prop: "strength", label: "Tear", min: 8, max: 64, step: 2, unit: "px", default: 36 },
    { type: "slider", prop: "duration", label: "Duration", min: 160, max: 800, step: 20, unit: "ms", default: 340 },
    { type: "slider", prop: "slices", label: "Slices", min: 4, max: 14, step: 1, default: 10 },
    { type: "toggle", prop: "fringes", label: "Colour fringes", default: true },
  ],
  howItWorks:
    "The button's look is one small piece of markup, the face: a fill and border mixed from the state's colour with color-mix (so every state stays soft on white), four absolutely placed corner brackets in the colour at full strength, and the label. The face is drawn once for the button itself. On click the state advances, and for Duration a timer deals a new broken frame every 48ms: it cuts the height into Slices uneven bands, and for each band renders another copy of the face clipped to it with clip-path: inset() and pushed sideways with a transform, up to Tear px (a quarter of the bands tear twice as far, and three in ten don't move). Each band shows either the old or the new face: early on mostly the old, later mostly the new, so the labels tear over each other, and the tears shrink as it goes. With Colour fringes on, some bands get a second copy in one of five band colours (the same ones as the Surprise button), at half strength, blended with multiply, and pushed the other way. Because the frames are dealt, not tweened, it stutters like a broken signal; when the time is up the slices go and the face is simply the new state. The button carries aria-live=\"polite\", so screen readers hear the new label; reduced motion switches without the glitch. states takes any list of {label, color}.",
  cardHeight: 260,
};
