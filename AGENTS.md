# Rekt UI — frontend (rektui-frontend)

Curated UI motion / component library, sold with Pro accounts. Next.js 16, Tailwind v4,
own `Dockerfile`, deploys as its own Coolify resource. The API is the separate
**rektui-backend** repo (NestJS); this app has no server code of its own.

**This repo is public.** Never commit secrets or Pro component source. Pro source lives in
the backend's database and reaches Pro accounts through `GET /components/:id/source`.

Design source of truth: Figma file `dbKPK65fA82qNvVafpPXls`, frames `286:605`
(Default View) and `286:3044` (Full View). Fetch only the node you are changing.

## Commands (Node 24)
`npm install`, `npm run dev`, `npm run build`, `npm run typecheck`

## Conventions
- Tokens live in `app/globals.css` (`--bg`, `--surface`, `--line`, `--ink`, `--ink-2`,
  `--ink-3`, `--icon`, radii, `--ease-out-strong`). No raw hex in components.
  Muted text is darkened from the mock's `#808080` / `#B8B8B8` to `--ink-2` / `--ink-3`
  so 13px text clears WCAG 2.2 AA.
- Icons are the Figma SVGs in `public/icons`, drawn as CSS masks by
  `components/shell/Icon.tsx` so they follow the theme. Don't hand-draw SVGs.
- Motion follows Beautiful UI: `--ease-out-strong`, `fade-up`, `pop-in`, press
  `active:scale-[0.96]`. `prefers-reduced-motion` is honoured globally in `globals.css`.
- There is no Add Component UI. The library is curated in code.

## Adding a component
1. Build the preview in `components/previews/<Name>.tsx`. It receives `paused`,
   `startedAt` and `expanded` plus its preset props, and must stop animating when
   `paused` is true.
2. Add a `ComponentItem` to the category's `items` array in
   `lib/registry/categories/<category>.ts` — title, description, source fields,
   `presets`, `code`.
   Set `replay: true` when the preview plays once and stops (a reveal, a run, a flow).
   The canvas then shows a replay button, which remounts the preview — the surface keys
   it on `startedAt`. Leave it off for looping, static or hover-driven components.
3. It renders below the existing entries automatically, with its own deep link
   `#<item id>`.

New category: add a `ComponentCategory` to `lib/registry/index.ts`. Categories with no
items are filtered out — they are not listed and their route 404s, so a page only exists
once it has something to show.

## Adding a Rekt tool
Rekt's own tools are the second sidebar group and live in `lib/registry/tools.ts`: add a
`ToolEntry` (id, sidebar name, page title, description, component) and `/create/<id>`,
the nav row and the page appear. `ToolShell` supplies the frame; the tool itself owns its
controls. REKT / CODE is the worked example — `components/create/code/` for the UI,
`lib/create/code/` for the animation engine, syntax palette and snippet builder, each
piece small enough to reuse in the next tool.

## Attribution
External components keep `sourceName`, `sourceUrl`, `instructionUrl` and `license`, shown
on the entry and in the Code panel. Only set `code.sourceIncluded: true` when the licence
allows redistributing the source; otherwise ship usage examples and link to the original.

## Site, accounts and billing
The library is a product now: a header (`components/site/SiteHeader.tsx`) with **UI**
(the categories and tools), **Good designs of X** and **Pricing**, plus an account menu
(Saved, Account & billing, Sign out).

- **Good designs of X** (`/good-designs?x=<id>`): the X list is `DESIGN_XS` in
  `lib/good-designs.ts`; entries are `data/good-designs.json`, seeded from the
  build.studiorekt.com directory with screenshots served from there.
- **Accounts:** Supabase handles sign-in only — Google or an emailed link, no passwords
  (`components/site/SignInDialog.tsx`, PKCE, `app/auth/callback` swaps the code in the
  browser). Everything else goes to rektui-backend through `api()` in `lib/api.ts`, which
  sends the Supabase access token as a Bearer header.
- **Session:** `SessionProvider` (`lib/session.tsx`) loads `GET /me` (account, plan,
  bookmarks) in the browser, so every page stays static. Bookmarks are
  `PUT` / `DELETE /bookmarks/:kind/:id`, applied optimistically and reverted on error.
- **Billing:** Paddle overlay checkout (`components/pricing/CheckoutButton.tsx`) with
  `customData.user_id`; the backend's webhook records the plan. Plans and displayed
  prices are in `lib/plans.ts`. Billing portal and account deletion are backend calls.
- **Pro items:** set `tier: "pro"` on a `ComponentItem` and keep its `code.usage` a
  placeholder. Free accounts see a lock; Pro accounts get the real source from the backend.
- **Env:** `.env.example`. With nothing set the site runs signed out and the sign-in
  dialog says accounts are off. Every value is `NEXT_PUBLIC_*` and baked at build time,
  so in Coolify they must be build variables (the Dockerfile declares them as `ARG`s).
