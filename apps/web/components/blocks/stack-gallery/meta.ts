import type { UiBlockMeta } from "@/lib/ui/types";

/** Stack gallery, described for the site: the wall, the dialog and the registry. Plain data only. */
export const stackGalleryMeta: UiBlockMeta = {
  id: "stack-gallery",
  title: "Stack gallery",
  description:
    "Cards stacked in depth, each one further back standing a little higher, so you see the top of every card. Scroll, use the arrow keys or click a card to bring it forward: the front card tips toward you and sinks gently away, the stack moves up a place, and the next card fades in at the back. It loops.",
  category: "scroll",
  name: "StackGallery",
  files: ["StackGallery.tsx", "StackGallery.css"],
  dependencies: [],
  controls: [
    { type: "slider", prop: "visible", label: "Shown", min: 3, max: 9, step: 1, default: 8 },
    { type: "slider", prop: "depth", label: "Depth", min: 20, max: 90, step: 2, unit: "px", default: 46 },
    { type: "slider", prop: "speed", label: "Speed", min: 300, max: 1400, step: 50, unit: "ms", default: 650 },
    { type: "toggle", prop: "wheel", label: "Wheel", default: true },
  ],
  howItWorks:
    "Each card gets --d, how many places it is from the front, and the CSS turns that into translate3d(0, −d × rise, −d × depth) under a perspective whose origin sits above the stage, so cards further back come out higher and smaller with only their top edges showing; z-index keeps the nearer card on top. Only the first few cards show (Shown); the rest wait, transparent, in the last place, so there's always a card ready behind the stack. Moving forward changes every card's --d, and a transition glides each one up a place on a soft ease-out while the next waiting card fades in exactly where the last one was. The card that leaves the front gets a keyframe animation instead, a little longer than the step and on an ease-in-out: it tips toward you (rotateX) as it sinks past the floor and fades, then joins the hidden cards. Moving backward plays the same keyframes in reverse, so a hidden card rises into the front. Several steps (a click on a card deep in the stack, a quick scroll) are taken one at a time a short gap apart, so each card drops in turn; each drop starts from wherever the card is on screen at that moment (its current transform), so a run of drops flows without jumps. A card a long jump brings back into view fades in at its place once its drop ends. The wheel is a non-passive listener on the stage, so scrolling over the stack steps it rather than the page; switch Wheel off to leave scrolling alone. Each item takes a CSS background or an image URL, and a title that names it for screen readers. The front card is a button (onOpen), its name is announced politely on each change, the arrow keys step, and reduced motion swaps cards without moving them.",
  cardHeight: 460,
};
