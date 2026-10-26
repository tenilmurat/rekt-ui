# Rekt UI — frontend (rektui-frontend)

Rekt UI is its own product, sold on its own — not part of Rekt Studio or studiorekt.com.
Don't bring Rekt Studio branding, logos or links in. The name lives in `lib/brand.ts`;
the marks (`Wordmark`, `Monogram` in `components/site/Brand.tsx`) are text placeholders
until there is a drawn logo.

Curated UI motion / component library, sold with Pro accounts. Next.js 16, Tailwind v4,
own `Dockerfile`, deploys as its own Coolify resource. The API is the separate
**rektui-backend** repo (NestJS); this app has no server code of its own.

**This repo is public.** Never commit secrets or Pro component source. Pro source lives in
the backend's database and reaches Pro accounts through `GET /components/:id/source`.

Design: Figma file `dbKPK65fA82qNvVafpPXls`. Its frames `286:605` / `286:3044` are the
earlier sidebar library and no longer match; the wall layout below has no Figma frame yet.
Fetch only the node you are changing.

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
- There is no Add Component UI. The library is curated in code (`lib/ui/catalog.ts`).

## Layout
Modelled on bencho.dev's structure (not its code or content):
- **UI** (`/`, `components/wall/UiWall.tsx`): centred hero, category chips (`?category=`),
  then a 3-column masonry wall (`Masonry`: 1 / 2 / 3 columns at 0 / 640 / 1024px, 12px gaps,
  20px gutters). Cards are 28px-radius live previews with the name in a pill bottom left and
  save bottom right (`BlockCard`). Pressing a card opens `BlockDialog` over the wall
  (`?c=<id>`): stage with Preview / Code on the left, details, style presets, Share and the
  code action in a 300px panel on the right. A Pro band follows for free visitors.
- **Good designs of X** (`/good-designs`): same hero, chips and masonry, screenshot tiles
  (`DesignCard`) that open the live site.
- With nothing published the UI wall shows stand-in cards and a short notice.

## Publishing a component
The wall reads `BLOCKS` in `lib/ui/catalog.ts`, which **starts empty on purpose**.
1. Build the preview in `components/previews/<Name>.tsx`. It receives `paused`,
   `startedAt` and `expanded` plus its preset props, and must stop animating when
   `paused` is true.
2. Add an item to `BLOCKS`: `id`, `title`, `description`, `category` (an id from
   `UI_CATEGORIES`), `component`, optional `presets` (shown as Style in the dialog),
   `cardHeight` (varied heights make the masonry), `replay`, `tier`, `code`.
3. `UI_CATEGORIES` is a placeholder list until the categories are decided.

`lib/registry/categories` holds the earlier curated set (from the Studio-Rekt library). It
is **not published** — review an item before moving it into `BLOCKS`.

## Adding a tool
Rekt UI's own tools are the sidebar on `/create/<id>` pages and live in `lib/registry/tools.ts`: add a
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
  `lib/good-designs.ts`; entries are `data/good-designs.json`, screenshots in
  `public/good-designs` (960px-wide WebP).
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
