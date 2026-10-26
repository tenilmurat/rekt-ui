# Beautiful UI components

The components in this folder come from **Beautiful UI** (https://www.beautifului.dev/),
which publishes them under the **MIT License**. They are included here with attribution,
as MIT requires the copyright and permission notice to travel with the source.

Files: `LoadingState.tsx`, `ThinkingState.tsx`, `StreamingText.tsx`, `ApprovalCard.tsx`,
`ToolChips.tsx`.

Not from Beautiful UI — written for this app to satisfy their imports:
- `components/atoms/Button.tsx`
- `components/primitives/GlideMenu.tsx`
- the foundation tokens and utility classes in `app/globals.css`

Each entry in the registry carries `sourceName`, `sourceUrl` and `license: "MIT"`, so the
attribution is visible in the UI as well as here. Upstream is the canonical version:
install it with `npx shadcn@latest add https://www.beautifului.dev/r/<slug>.json`.
