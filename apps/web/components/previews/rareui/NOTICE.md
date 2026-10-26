# Rare UI components

**Rare UI** (https://www.rareui.com/) publishes free, open-source animated React
components under the **MIT License**; the registry lives at
https://github.com/Codewithswappy/RareUI. `Orbit.tsx` and `CodeBlock.tsx` are included
here with attribution.

## CodeBlock.tsx

Taken verbatim from their shadcn registry — `https://www.rareui.com/r/code-block.json`,
published at https://www.rareui.com/components/code-block. Nothing in it was changed.
It needs `motion`, `prism-react-renderer`, `lucide-react` and the `cn` helper, which is
why `lib/utils.ts` (clsx + tailwind-merge, the standard shadcn helper) now exists in this
app. `public/sources/rare-ui.svg` is their logo, used for attribution on the entry badge.

## Orbit.tsx

### What changed, and why

The snippet as supplied did not run. Three things:

1. It imported `useSpring` from `motion/react` and `animated` from the same module.
   `animated` is React Spring's API; Motion's equivalent is `motion.div`. Mixing the two
   libraries in one import fails at build time.
2. `angle.get()` was read during render, so `x` / `y` were computed once and never again —
   a motion value read that way does not re-render. They are now derived with
   `useTransform`, which subscribes to the value.
3. Nothing ever advanced `angle`, so the dot sat still at `(radius, 0)`. A
   `useAnimationFrame` loop now drives a target angle and the spring follows it, which is
   what keeps the original `stiffness: 80, damping: 20` feel.

Added: `size` and `paused` props. `paused` is required by this library — previews stop
animating when they scroll off-screen or the tab is hidden (see `lib/use-in-view.ts`).

## Not from Rare UI

`previews.tsx` in this folder — the ring, centre mark and preset wiring that present the
component on the library's canvas — is written for this app.
