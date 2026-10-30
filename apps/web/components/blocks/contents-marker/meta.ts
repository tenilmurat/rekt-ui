import type { UiBlockMeta } from "@/lib/ui/types";

/** Contents marker, described for the site: the wall, the dialog and the registry. Plain data only. */
export const contentsMarkerMeta: UiBlockMeta = {
  id: "contents-marker",
  title: "Contents marker",
  description:
    "A table of contents with a single dot beside the chosen section. Choose another and the dot flies there along a curve that bows outward, then settles beside the new label. Hovering only darkens the text.",
  category: "navigation",
  name: "ContentsMarker",
  files: ["ContentsMarker.tsx", "ContentsMarker.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "position",
      label: "Dot",
      options: [
        { value: "before", label: "Before" },
        { value: "after", label: "After" },
      ],
      default: "after",
    },
    { type: "slider", prop: "arc", label: "Arc", min: 0, max: 100, step: 5, default: 50 },
    { type: "slider", prop: "speed", label: "Speed", min: 250, max: 1200, step: 50, unit: "ms", default: 560 },
  ],
  howItWorks:
    "Each label's text is wrapped in a span, so the component can measure where it ends. The dot's resting place is just after the chosen label's text (Dot: After) or in a gutter on the left (Dot: Before), at the label's vertical centre; it's written as an inline transform. When you choose another section, the dot flies there with the Web Animations API along a quadratic curve: the control point sits out to the dot's side, further out the longer the trip (the Arc control scales it), and the path is sampled into keyframes and played on a soft ease-out, so it swings out and settles. Labels have different widths, so the curve adapts to each trip. If you choose again mid-flight, the new flight starts from wherever the dot is on screen. Hovering only darkens the text. Items are real links that set aria-current and smooth-scroll to the matching id; reduced motion makes the dot jump instead of fly.",
  cardHeight: 380,
};
