# Fancy Components

**Fancy Components** (https://www.fancycomponents.dev/) by Daniel Petho publishes these
under the **MIT License** — source at https://github.com/danielpetho/fancy. The four files
in `text/` were fetched from their shadcn registry (`https://fancycomponents.dev/r/<name>.json`)
and are included **verbatim**, with attribution:

- `text/text-rotate.tsx`
- `text/typewriter.tsx`
- `text/scramble-hover.tsx`
- `text/scramble-in.tsx`

They need `motion` and the `cn` helper in `lib/utils.ts`; both were already here for the
Rare UI components. `public/sources/fancy-components.png` is their site icon, used for
attribution on the entry badge.

## Not from Fancy Components

`previews.tsx` in this folder. Their published demos are full-page (`w-dvw h-dvh`, page
type scales, fixed paddings); these wrappers fit the same components onto the library's
preview canvas and keep the demo content — "Make it …", "We're born 🌞 to …", the model
list, the Daft Punk track list — so each entry shows what the docs show.

The wrappers also add the pause the library requires: when a preview scrolls off-screen or
the tab is hidden it unmounts the animating component and leaves a static frame in its
place, so no timers run off-screen and the card never goes blank.
