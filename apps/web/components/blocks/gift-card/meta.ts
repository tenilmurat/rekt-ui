import type { UiBlockMeta } from "@/lib/ui/types";

/** Gift card, described for the site: the wall, the dialog and the registry. Plain data only. */
export const giftCardMeta: UiBlockMeta = {
  id: "gift-card",
  title: "Gift card",
  description:
    "A glassy gift card with a living background: soft light drifts slowly behind white line art, laurel branches that sway, or confetti, rings or stars, with a gift at the centre and a small engraving along the edge. Choose a rounded, ticket or stamp outline and one of three palettes; on hover it tips toward the pointer and a sheen slides across.",
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
        { value: "laurel", label: "Laurel" },
        { value: "confetti", label: "Confetti" },
        { value: "rings", label: "Rings" },
        { value: "stars", label: "Stars" },
      ],
      default: "laurel",
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
    { type: "toggle", prop: "tilt", label: "Tilt on hover", default: true },
  ],
  howItWorks:
    "The card is a 320 × 202 box (a bank card's 1.58:1), turned 5° and filled with a three-stop gradient: deep at the top, a mid colour, light below. Over it, two blurred radial blobs drift slowly on long alternating CSS animations, a bright one low down and a cooler one high up, using transforms only so they run on the compositor. The pattern is an SVG in the same 320 × 202 units, white at a quarter strength, panning a few px as a whole: Laurel is drawn in code, each branch a quadratic stem with paired almond leaves that shrink toward the tip, swaying a few degrees on its base, each on its own delay; Confetti is a seeded scatter of strips and dots that bob; Rings are thin circles spreading from a corner that breathe in turn; Stars are four-point sparkles that twinkle. The engraving (mark) runs along the right edge in a serif. The gift is Lucide's gift with a frosted fill and a soft glow, floating gently. Shapes are CSS: Rounded is a border radius; Ticket bites a notch from each side with two radial-gradient masks; Stamp scallops the top and bottom with repeating radial masks. The shadow is a drop-shadow on the wrapper, so it follows the notches and scallops. On hover the pointer's place over the card is written straight to CSS variables (no re-render): the card tips up to about 7° toward it in 3D, and a band of light slides across in step. It's an image to screen readers, named by label. Reduced motion holds everything still.",
  cardHeight: 340,
};
