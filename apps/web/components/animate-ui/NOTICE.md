# Animate UI — animated icons

**Animate UI** (https://animate-ui.com) by Skyleen publishes these under the **MIT License**;
source at https://github.com/animate-ui/animate-ui. They are Lucide icons animated with
Motion — Lucide itself is ISC.

Everything here was fetched from their registry and is included **verbatim**, at the paths
their registry targets, so a future `shadcn add` updates these files in place:

- `components/animate-ui/icons/icon.tsx` — the wrapper (`https://animate-ui.com/r/icons-icon.json`)
- `components/animate-ui/icons/<name>.tsx` — 259 icons (`https://animate-ui.com/r/icons-<name>.json`)
- `components/animate-ui/primitives/animate/slot.tsx`
- `hooks/use-is-in-view.tsx`

They need `motion` and the `cn` helper in `lib/utils.ts`; both were already in this app.

## How this app uses them

`components/create/icon/` — the REKT / ICON tool. Icons are loaded one at a time by dynamic
import, so the page ships the picker's names, not 259 components. The tool drives their own
props: `animation` (each icon's bespoke `default`, or the shared `path` / `path-loop`
draw-on), `loop`, `loopDelay` and `animate`.

Their note, kept here because it matters: the animated icons are in beta, and props may
change between versions.
