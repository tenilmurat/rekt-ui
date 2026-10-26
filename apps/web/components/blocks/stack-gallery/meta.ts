import type { UiBlockMeta } from "@/lib/ui/types";

/** Stack gallery, described for the site: the wall, the dialog and the registry. Plain data only. */
export const stackGalleryMeta: UiBlockMeta = {
  id: "stack-gallery",
  title: "Stack gallery",
  description:
    "Cards stacked in depth, each one further back standing a little higher, so you see the top of every card. Scroll, use the arrow keys or click a card to bring it forward: the front card tips toward you and drops away, and the stack moves up a place. It loops.",
  category: "scroll",
  name: "StackGallery",
  files: ["StackGallery.tsx", "StackGallery.css"],
  dependencies: [],
  controls: [
    { type: "slider", prop: "depth", label: "Depth", min: 20, max: 90, step: 2, unit: "px", default: 46 },
    { type: "slider", prop: "speed", label: "Speed", min: 300, max: 1400, step: 50, unit: "ms", default: 650 },
    { type: "toggle", prop: "wheel", label: "Wheel", default: true },
  ],
  howItWorks:
    "Each card gets --d, how many places it is from the front, and the CSS turns that into translate3d(0, −d × rise, −d × depth) under a perspective whose origin sits above the stage, so cards further back come out higher and smaller with only their top edges showing; z-index keeps the nearer card on top. Moving forward changes every card's --d, and a transition glides each one up a place on a soft ease-out. The card that leaves the front gets a keyframe animation instead: it tips toward you (rotateX) as it drops past the floor and fades, then reappears at the back; moving backward plays the same keyframes in reverse, so the last card rises into the front. Several steps (a click on a card deep in the stack, a quick scroll) are taken one at a time a short gap apart, so each card drops in turn. The wheel is a non-passive listener on the stage, so scrolling over the stack steps it rather than the page; switch Wheel off to leave scrolling alone. Each item takes a CSS background or an image URL. The front card is a button (onOpen), the caption fades in on each change and is announced politely, the arrow keys step, and reduced motion swaps cards without moving them.",
  cardHeight: 480,
};
