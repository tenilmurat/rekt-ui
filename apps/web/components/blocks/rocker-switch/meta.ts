import type { UiBlockMeta } from "@/lib/ui/types";

/** Rocker switch, described for the site: the wall, the dialog and the registry. Plain data only. */
export const rockerSwitchMeta: UiBlockMeta = {
  id: "rocker-switch",
  title: "Rocker switch",
  description:
    "A rocker switch seen from above in 3D: a pill-shaped plate on the ground, hinged at its seam into ON and OFF halves. The pressed half lies flat; the other is raised from the seam on a wedge of coloured wall. Click it and they swap on a springy seesaw, a row of dots beside it lights up in turn, and when it's on the ground goes dark and the switch glows, its raised end glowing with drifting white particles inside it and spilling white light across the ground.",
  category: "press",
  name: "RockerSwitch",
  files: ["RockerSwitch.tsx", "RockerSwitch.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "color",
      label: "Colour",
      options: [
        { value: "purple", label: "Purple" },
        { value: "coral", label: "Coral" },
        { value: "mint", label: "Mint" },
      ],
      default: "purple",
    },
    { type: "slider", prop: "tilt", label: "Tilt", min: 4, max: 24, step: 1, unit: "°", default: 14 },
    { type: "slider", prop: "depth", label: "Base", min: 0, max: 16, step: 1, unit: "px", default: 0 },
    { type: "slider", prop: "speed", label: "Speed", min: 250, max: 1400, step: 50, unit: "ms", default: 700 },
  ],
  howItWorks:
    "The scene is a 260×96 box turned into the isometric view with rotateX(52°) rotateZ(−45°) under an 1100px perspective, with transform-style: preserve-3d all the way down, so everything inside is really in 3D. The top is two halves, each absolutely placed with its transform-origin on the seam: the pressed half lies flat at Base height, and the other turns up from the seam with rotateY(±Tilt), so its far end stands (length ÷ 2) × sin(Tilt) above the ground. Under each half is its own wedge: the pill stacked one px at a time, each layer clipped (clip-path: inset) to start where the raised top passes its height, height ÷ tan(angle) out from the seam, so the stack slopes up from the seam to the raised end; the base layers run the whole length. The two halves' angles are registered custom properties (@property, <angle>), and switching transitions them, 14° to 0° on one half and 0° to 14° on the other, on an ease-out (cubic-bezier(0.2, 0.9, 0.3, 1)) over Speed: the halves turn on those angles and every wedge layer is cut from the same angle (CSS tan()), so the body fits the top on every frame of the seesaw, and as a half comes down its layers slide out past the end. Every layer is shaded from the lit corner to the far one, so the wall's colour runs round the rounded end, and darkens toward the ground. The pressed half is flush with the ground: the same colour (--rk-rocker-bg, set it to whatever the switch sits on), with a faint rim to mark its edge, and its label is ink (white when it's on, on the dark ground); the raised half is paler. Each raised half throws its own shadow: a blurred copy of the pill clipped to that half, pushed past its end and to the near side, and as strong as the half is raised (its angle over the full tilt), so the pressed half throws none. When it's on, the component sets data-rk-dark on itself, which a parent can follow to darken the ground (the wall's cards and the dialog do, with :has()), and the same variables take dark values over Speed: the plate near-black with a thin outline and a glow in the accent, the wall pale and lit, the shadow a blurred accent glow, and the dots white. The dots light up in turn: each one's transition-delay is its place in the row, counted from the OFF end when switching on and from the ON end when switching off. It's a real control: role=\"switch\" with aria-checked, Space and Enter, and checked / defaultChecked / onChange. Reduced motion switches without the rock or the run.",
  cardHeight: 420,
};
