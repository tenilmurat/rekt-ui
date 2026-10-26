import type { UiBlockMeta } from "@/lib/ui/types";

/** Contents marker, described for the site: the wall, the dialog and the registry. Plain data only. */
export const contentsMarkerMeta: UiBlockMeta = {
  id: "contents-marker",
  title: "Contents marker",
  description:
    "A table of contents with a single dot that springs to the section you point at, overshooting a little before it settles. Choosing a section scrolls to it.",
  category: "navigation",
  name: "ContentsMarker",
  files: ["ContentsMarker.tsx", "ContentsMarker.css"],
  dependencies: [],
  controls: [
    {
      type: "segmented",
      prop: "fill",
      label: "Fill",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
      default: "dark",
    },
    {
      type: "segmented",
      prop: "follow",
      label: "Follow",
      options: [
        { value: "hover", label: "Hover" },
        { value: "click", label: "Click" },
      ],
      default: "hover",
    },
    { type: "slider", prop: "bounce", label: "Bounce", min: 0, max: 100, step: 5, default: 60 },
  ],
  howItWorks:
    "The list measures the item that should be marked (the one you point at with Follow: Hover, or the one you chose) and writes its vertical centre to a CSS variable. The dot is absolutely positioned and moves there with a transform transition on a cubic-bezier whose second control point goes above 1, which is what makes it overshoot and bounce back; the Bounce control raises that point. The dot stays hidden until the first measurement, so it never flies in from the top. Items are real links: choosing one marks it as the current location (aria-current) and smooth-scrolls to the element with the matching id if the page has one. Keyboard focus moves the dot too, and reduced motion makes it jump instead of spring.",
  cardHeight: 340,
};
