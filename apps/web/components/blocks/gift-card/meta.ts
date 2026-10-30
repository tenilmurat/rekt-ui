import type { UiBlockMeta } from "@/lib/ui/types";

/** Gift card, described for the site: the wall, the dialog and the registry. Plain data only. */
export const giftCardMeta: UiBlockMeta = {
  id: "gift-card",
  title: "Gift card",
  description:
    "A small glassy gift card, icon-sized for a button or a banner, with a living background: soft light drifts slowly behind white line art, fern branches that sway, or confetti, rings or stars, with a softly glowing gift at the centre. Choose a rounded, ticket or stamp outline and one of three palettes; on hover it tips toward the pointer and a sheen slides across.",
  category: "hover",
  name: "GiftCard",
  files: ["GiftCard.tsx", "GiftCard.css"],
  dependencies: ["lucide-react"],
  controls: [
    {
      type: "segmented",
      prop: "pattern",
      label: "Pattern",
      options: [
        { value: "fern", label: "Fern" },
        { value: "confetti", label: "Confetti" },
        { value: "rings", label: "Rings" },
        { value: "stars", label: "Stars" },
      ],
      default: "fern",
    },
    {
      type: "segmented",
      prop: "shape",
      label: "Shape",
      options: [
        { value: "rounded", label: "Rounded" },
        { value: "ticket", label: "Ticket" },
        { value: "stamp", label: "Stamp" },
      ],
      default: "rounded",
    },
    {
      type: "segmented",
      prop: "palette",
      label: "Colours",
      options: [
        { value: "ocean", label: "Ocean" },
        { value: "dusk", label: "Dusk" },
        { value: "mint", label: "Mint" },
      ],
      default: "ocean",
    },
    { type: "slider", prop: "width", label: "Size", min: 40, max: 320, step: 4, unit: "px", default: 96 },
    { type: "shuffle", prop: "layout", label: "Layout", default: 0 },
    { type: "toggle", prop: "tilt", label: "Tilt on hover", default: true },
  ],
  howItWorks:
    "The card is icon-sized by default (96 px wide; Size goes from 40 to 320) at a bank card's 1.58:1, turned 5°; it's drawn at 320 × 202 and every size in the CSS is a multiple of --rk-gift-u, one design pixel at the chosen width, so the corners, glow, shadow, notches and scallops all scale together. It's filled with a three-stop gradient: deep at the top, a mid colour, and the light colour taking the lower part. Over it, two blurred radial blobs drift slowly on long alternating CSS animations, a bright one low down and a cooler one high up, using transforms only so they run on the compositor. The pattern is an SVG in the same 320 × 202 units, white at a quarter strength, panning a few px as a whole: Fern is one branch drawn in code and placed four times at different spots, sizes and angles: a sturdy straight stem, bare at its base, with four pairs of plump, pointed leaves leaning toward the tip (pinched where they join, so the stem shows between them) and one leaf at the tip; the pattern fades as one layer so overlaps don't double up; each branch swaying a few degrees on its base on its own delay; Confetti is a handful of big, soft strips, dots and arcs spread over a loose grid, each bobbing; Rings are a few thick circles spreading from a corner that breathe in turn; Stars are six soft four-point sparkles that twinkle. The shapes are few and big on purpose, so they still read on a small card. layout shuffles them: 0 is the designed layout, and any other number seeds a small random generator, so the same number always gives the same arrangement (and server and browser agree). A shuffled Fern picks one spot on each side of the card where a branch can grow clear of the gift (so two never crowd a corner) and turns and sizes each a little; Confetti re-scatters over its grid; Rings move to a random corner; Stars put one sparkle in each sixth of the card, the middle two kept above and below the gift. The gift is Lucide's gift as a frosted glass outline: thick see-through white strokes with nothing inside, a thinner blurred copy down the middle of each stroke so it reads as a tube, two soft drop-shadow halos and a faint white bloom behind it, floating gently; a full-white copy of it, masked to a slanted band, sweeps across every few seconds as a glint. Shapes are CSS: Rounded is a border radius; Ticket bites a notch from each side with two radial-gradient masks; Stamp scallops the top and bottom with repeating radial masks. The shadow is two soft drop-shadows on the wrapper, a wide faint one and a light one close in, so it follows the notches and scallops. On hover the pointer's place over the card is written straight to CSS variables (no re-render): the card tips up to about 7° toward it in 3D, and a band of light slides across in step. It's an image to screen readers, named by label. Reduced motion holds everything still.",
  cardHeight: 220,
};
