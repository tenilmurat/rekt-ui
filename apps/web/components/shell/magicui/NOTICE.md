# Magic UI

**Magic UI** (https://magicui.design) publishes its components under the **MIT License** —
source at https://github.com/magicuidesign/magicui. `animated-theme-toggler.tsx` was fetched
from their registry (`https://magicui.design/r/animated-theme-toggler.json`) and is included
**verbatim**. The component credits Nazam Kalsi, chishiyac and dikshantgulekar20-oss.

It needs `lucide-react` and the `cn` helper in `lib/utils.ts`; both were already here.

## CSS it depends on

The registry ships one rule, in `app/globals.css`:

```css
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
```

The component also writes `--magicui-theme-vt-clip-from` and
`--magicui-theme-toggle-vt-duration` onto `<html>` while a transition runs, and its own
comments say the collapsed clip-path must be pinned in CSS so Firefox doesn't paint the new
theme unclipped before the JS animation starts. The registry `css` block doesn't carry that
rule, so this app adds it next to theirs — see the `[data-magicui-theme-vt="active"]` rule
in `globals.css`.

## How this app uses it

Controlled, which their docs describe for next-themes: `theme` and `onThemeChange` are
passed, so the component doesn't touch localStorage and `useTheme()` stays the source of
truth. `components/shell/ThemeToggle.tsx` wraps it with this site's button chrome and
passes `duration={0}` when the visitor prefers reduced motion.
