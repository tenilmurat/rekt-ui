import type { UiBlockMeta } from "@/lib/ui/types";

/** Rocker switch, described for the site: the wall, the dialog and the registry. Plain data only. */
export const rockerSwitchMeta: UiBlockMeta = {
  id: "rocker-switch",
  title: "Rocker switch",
  description:
    "A rocker switch seen from above in 3D: a pill-shaped plate split into ON and OFF halves that rocks about its seam like a seesaw. Click it and the pressed half drops while the other lifts to show the plate's coloured side, on a springy rock, and a row of dots beside it lights up in turn, with the word RE…KT spelled round the switch.",
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
    { type: "slider", prop: "tilt", label: "Tilt", min: 4, max: 18, step: 1, unit: "°", default: 12 },
    { type: "slider", prop: "depth", label: "Depth", min: 12, max: 48, step: 1, unit: "px", default: 34 },
    { type: "slider", prop: "speed", label: "Speed", min: 250, max: 1400, step: 50, unit: "ms", default: 650 },
  ],
  howItWorks:
    "The scene is a 260×96 box turned into the isometric view with rotateX(52°) rotateZ(−45°) under an 1100px perspective, with transform-style: preserve-3d all the way down, so everything inside is really in 3D. The plate is a pill: its top face is a flex row of two halves with a 1px seam, and its side is the same pill repeated Depth times, each copy translateZ'd one px lower, filled with a gradient of the accent from its lit corner to its far one (so the wall's colour runs round the rounded ends) and a little darker than the one above (brightness from --rk-rocker-down), so it stacks into a solid, shaded slab. The plate is raised by depth + (length ÷ 2) × sin(Tilt), so the pressed end's bottom edge rests on the ground, and rocks with rotateY(±Tilt) about its centre: off, the OFF half is down and the ON half lifts, showing the side under it; on, the reverse. The rock runs on a spring curve (cubic-bezier(0.34, 1.45, 0.64, 1)) over Speed, so it overshoots a little and settles. The lifted half is lit a touch lighter and the pressed half darker, the pressed half's label goes to ink, and a blurred ground shadow leans the other way. Along the plate's near edge a row of 14 dots carries the word: each dot's transition-delay is its place in the row, counted from the OFF end when switching on and from the ON end when switching off, so the accent runs along the row rather than switching at once. It's a real control: role=\"switch\" with aria-checked, Space and Enter, and checked / defaultChecked / onChange. Reduced motion switches without the rock or the run.",
  cardHeight: 400,
};
