import type { UiBlockMeta } from "@/lib/ui/types";

/** Rocker switch, described for the site: the wall, the dialog and the registry. Plain data only. */
export const rockerSwitchMeta: UiBlockMeta = {
  id: "rocker-switch",
  title: "Rocker switch",
  description:
    "A rocker switch seen from above in 3D: a pill-shaped plate, split into ON and OFF halves, that rests on the ground at one end and tilts up to the other on a wedge of coloured wall. Click it and it rocks like a seesaw to rest on the other end, a row of dots beside it lights up in turn with the word RE…KT round it, and when it's on the ground goes dark and the switch glows.",
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
    { type: "slider", prop: "tilt", label: "Tilt", min: 3, max: 16, step: 1, unit: "°", default: 9 },
    { type: "slider", prop: "speed", label: "Speed", min: 250, max: 1400, step: 50, unit: "ms", default: 700 },
  ],
  howItWorks:
    "The scene is a 260×96 box turned into the isometric view with rotateX(52°) rotateZ(−45°) under an 1100px perspective, with transform-style: preserve-3d all the way down, so everything inside is really in 3D. The plate is one piece: a pill with two halves and a seam, turned about its middle by the plate's angle and held up by half its length × sin(angle), so its low end rests on the ground. The angle is a registered custom property (@property, <angle>): +Tilt when off (the ON end up), −Tilt when on, and switching transitions it on an ease-out (cubic-bezier(0.2, 0.9, 0.3, 1)) over Speed, so the plate rocks through flat like a seesaw. Under it is the wedge: the pill stacked one px at a time, each layer clipped (clip-path: inset) to start height ÷ tan(angle) in from the pressed end (CSS tan() on the same animated angle), so it's a knife edge on the ground at the pressed end, as tall as length × sin(Tilt) at the other, and fits the plate on every frame; every layer is shaded from the lit corner to the far one, so the wall's colour runs round the rounded end, and darkens toward the ground. The raised end throws a shadow: a blurred pill clipped softly to that half, pushed past its end and to the near side, as strong as the end is raised; the pressed end throws none. The pressed half's label lights up white; the raised half is a touch paler. The component reports the ground it wants in data-rk-ground on its root, a mid grey off and near-black on, and anything it sits in can paint itself that colour (the wall's cards and the dialog do); when on, the same variables take dark values over Speed: the plate near-black with a thin outline and a glow in the accent, the wedge pale and lit, the shadow a blurred accent glow, and the dots white. The dots light up in turn: each one's transition-delay is its place in the row, counted from the OFF end when switching on and from the ON end when switching off. It's a real control: role=\"switch\" with aria-checked, Space and Enter, and checked / defaultChecked / onChange. Reduced motion switches without the rock or the run.",
  cardHeight: 420,
};
