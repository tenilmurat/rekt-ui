import type { UiBlockMeta } from "@/lib/ui/types";

/** Rocker switch, described for the site: the wall, the dialog and the registry. Plain data only. */
export const rockerSwitchMeta: UiBlockMeta = {
  id: "rocker-switch",
  title: "Rocker switch",
  description:
    "A rocker switch seen from above in 3D: a pill-shaped wedge on the ground, split into ON and OFF halves, that rocks like a seesaw. Click it and the pressed end sinks to the floor while the other end rises on a tall coloured wall, on a springy rock, and a row of dots beside it lights up in turn, with the word RE…KT spelled round the switch.",
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
    { type: "slider", prop: "tilt", label: "Tilt", min: 4, max: 20, step: 1, unit: "°", default: 12 },
    { type: "slider", prop: "depth", label: "Base", min: 1, max: 16, step: 1, unit: "px", default: 4 },
    { type: "slider", prop: "speed", label: "Speed", min: 250, max: 1400, step: 50, unit: "ms", default: 650 },
  ],
  howItWorks:
    "The scene is a 260×96 box turned into the isometric view with rotateX(52°) rotateZ(−45°) under an 1100px perspective, with transform-style: preserve-3d all the way down, so everything inside is really in 3D. The body is the pill stacked one px at a time from the ground up: the first Base layers go the whole length, and each layer above stops short of the pressed end by a growing share of the length (clip-path: inset), so the stack is a wedge, thin where it's pressed and as tall as length × sin(Tilt) where it lifts; every layer is shaded across its area from the lit corner to the far one, so the wall's colour runs round the rounded ends, and darkens toward the ground. The top face is a flex row of two halves with a 1px seam, held at the wedge's mid height and swung about the plate's middle with rotateY(±Tilt), so one end sits on the base and the other on the top of the wall. Switching flips which end the layers are cut from and the face's swing; both ease on a spring curve (cubic-bezier(0.34, 1.45, 0.64, 1)) over Speed, so the rock overshoots a little and settles. The lifted half is lit a touch lighter and the pressed half darker, the pressed half's label goes to ink, and a blurred ground shadow is thrown toward the lifted end. Along the plate's near edge a row of 14 dots carries the word: each dot's transition-delay is its place in the row, counted from the OFF end when switching on and from the ON end when switching off, so the accent runs along the row rather than switching at once. It's a real control: role=\"switch\" with aria-checked, Space and Enter, and checked / defaultChecked / onChange. Reduced motion switches without the rock or the run.",
  cardHeight: 400,
};
