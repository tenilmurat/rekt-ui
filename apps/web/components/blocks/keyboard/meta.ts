import type { UiBlockMeta } from "@/lib/ui/types";

/** Keyboard, described for the site: the wall, the dialog and the registry. Plain data only. */
export const keyboardMeta: UiBlockMeta = {
  id: "keyboard",
  title: "Keyboard",
  description:
    "A 60% keyboard drawn in thin isometric lines, white or dark. The key under the pointer sinks and the keys round it follow it down, less the further away they are, then spring back up when the pointer moves on. Type on your own keyboard and the same keys go down. Higher intensity sinks a wider patch of keys.",
  category: "hover",
  name: "Keyboard",
  files: ["Keyboard.tsx", "Keyboard.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "look",
      label: "Style",
      options: [
        { value: "white", label: "White" },
        { value: "dark", label: "Dark" },
      ],
      default: "white",
    },
    { type: "slider", prop: "intensity", label: "Intensity", min: 0, max: 1, step: 0.05, default: 0.5 },
    { type: "toggle", prop: "typing", label: "Follow typing", default: true },
  ],
  howItWorks:
    "It's one SVG, no images and no 3D library. Five rows of keys (61, each named by its KeyboardEvent.code and 1–6.25 units wide, every row 15 units) stand on a rounded case, all placed on a ground plane and projected to the screen isometrically: x runs down to the right, y down to the left, height straight up. Each box (the case, each keycap) is a rounded rectangle outline; its top is that outline lifted to its height, and its two visible sides are the stretch of outline from the rightmost point to the front corner and from there to the leftmost, joined to the same stretch higher up. A keycap's top is a little smaller than its base, so it tapers. Everything is drawn back row first, left to right, so nearer keys cover farther ones. On pointer move the pointer is turned back from the screen into the plane of the key tops, and each frame every key's depth eases towards a target: all the way down (0.36 units) for the key under the pointer or one being typed, and for the rest (1 − distance / radius)^1.6 of that, where the radius grows with intensity from about one key to three. A requestAnimationFrame loop, running only while something is still moving, rewrites the three paths of each key that moved, with no React render, and marks the hot key so its lines go dark (light on the dark style). Typing listens on the window only while the keyboard is on screen, and not while you're typing in a field. Reduced motion snaps keys down and up without easing. The look is CSS variables: --rk-kb-top, -left, -right, -case, -line and -hot.",
  cardHeight: 300,
};
