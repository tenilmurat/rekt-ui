# Kokonut UI

**Kokonut UI** (https://kokonutui.com) by @dorianbaffier publishes its components under the
**MIT License** — source at https://github.com/kokonut-labs/kokonutui.
`text/shimmer-text.tsx` was fetched from their registry
(`https://kokonutui.com/r/shimmer-text.json`) and is included here with attribution.

It needs `motion` and the `cn` helper in `lib/utils.ts`; both were already in this app.
`public/sources/kokonut-ui.png` is their site icon, used for attribution on the entry badge.

## The one change

Upstream the shimmer runs at a fixed `duration: 2.5`. A `duration` prop was added, with 2.5
as its default, so the entry can offer Slow / Normal / Fast without forking the component.
Nothing else was touched — the markup, the gradient and the easing are theirs.

## Not from Kokonut UI

`previews.tsx` in this folder: the preset wiring, the size it renders at in Full View, and
the still frame shown while the preview is off-screen.
