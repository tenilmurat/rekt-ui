# Rekt UI — website (`apps/web`)

Rekt UI is its own product, sold on its own — not part of Rekt Studio or studiorekt.com.
Don't bring Rekt Studio branding, logos or links in. The name lives in `lib/brand.ts`;
the marks (`Wordmark`, `Monogram` in `components/site/Brand.tsx`) are text placeholders
until there is a drawn logo.

Curated UI motion / component library, sold with Pro accounts. Next.js 16, Tailwind v4,
own `Dockerfile`, deploys as its own Coolify resource. The API is the separate
API in `apps/api` (NestJS); this app has no server code of its own.

**This repo is public.** Never commit secrets or Pro component source. Pro source lives in
the backend's database and reaches Pro accounts through `GET /components/:id/source`.

Design: Figma file `dbKPK65fA82qNvVafpPXls`. Its frames `286:605` / `286:3044` are the
earlier sidebar library and no longer match; the wall layout below has no Figma frame yet.
Fetch only the node you are changing.

## Commands (Node 24)
`npm install`, `npm run dev`, `npm run build`, `npm run typecheck`

## Conventions
- Tokens live in `app/globals.css` (`--bg`, `--surface`, `--line`, `--ink`, `--ink-2`,
  `--ink-3`, `--icon`, radii, `--ease-out-strong`). No raw hex in site components (the blocks in `components/blocks` are the exception: they carry hex fallbacks so they work anywhere).
  Muted text is darkened from the mock's `#808080` / `#B8B8B8` to `--ink-2` / `--ink-3`
  so 13px text clears WCAG 2.2 AA.
- Icons are the Figma SVGs in `public/icons`, drawn as CSS masks by
  `components/shell/Icon.tsx` so they follow the theme. Don't hand-draw SVGs.
- Motion follows Beautiful UI: `--ease-out-strong`, `fade-up`, `pop-in`, press
  `active:scale-[0.96]`. `prefers-reduced-motion` is honoured globally in `globals.css`.
- There is no Add Component UI. The library is curated in code (`lib/ui/catalog.ts`).
- Site chrome uses Tailwind; the components people take home (`components/blocks`) use plain CSS.

## Layout
Modelled on bencho.dev's structure (not its code or content):
- **UI** (`/`, `components/wall/UiWall.tsx`): centred hero, category chips (`?category=`),
  then a 3-column masonry wall (`Masonry`: 1 / 2 / 3 columns at 0 / 640 / 1024px, 12px gaps,
  20px gutters). Cards are 28px-radius live previews (`BlockCard`); `BlockDialog` opens over the wall
  (`?c=<id>`): Preview / Code stage on the left (Code = Install, Usage, Code, How it works,
  plus Copy prompt), and description, controls, Share and Save in a 320px panel on the right.
  Cards are live in place; the name pill and the round button open the dialog. A Pro band
  follows for free visitors.
- **Good designs of X** (`/good-designs`): same hero, chips and masonry, screenshot tiles
  (`DesignCard`) that open the live site.
- With nothing published the UI wall shows stand-in cards and a short notice.

## Components: what every one ships with
Rekt UI sells components people take into their own projects, so each one is real,
self-contained source — **one `.tsx` and one `.css`**, no Tailwind, no imports from this app:

```
components/blocks/<id>/
  <Name>.tsx   # "use client", named export <Name>, typed props with defaults
  <Name>.css   # class prefix rk-<short>-, colours as --rk-<short>-* variables with fallbacks,
               # prefers-reduced-motion handled
  meta.ts      # the site's description of it (UiBlockMeta): plain data, read on the server too
  index.ts     # meta + the component + its CSS import, for the wall and the dialog
```

`meta.ts` exports a `UiBlockMeta` (`lib/ui/types.ts`): `id`, `title`, `description`,
`category` (an id from `UI_CATEGORIES`), `component`, `name`, `files` (the .tsx first),
`dependencies` (npm packages beyond React), `controls`, `howItWorks`, `cardHeight`,
`tier`, and `source` for credit.

The dialog builds everything else from that, so nothing is written twice:
- **Controls** (`segmented` / `toggle` / `slider`), one per prop. The preview and the card
  render with the tuned values.
- **Install**: tabs. **rektui** — `npx rektui@latest add <id>`, Rekt UI's own CLI (repo
  `packages/cli`), shown once `NEXT_PUBLIC_REKTUI_CLI=1`. **shadcn** —
  `npx shadcn@latest add <site>/r/<id>.json`. Both put the files in the user's
  `components/rekt-ui/` and install the dependencies. **Manual** — `npm install
  <dependencies>`, then the files from the Code section.
- **Usage**: imports from `@/components/rekt-ui/` + JSX with the tuned props
  (`lib/ui/snippets.ts`).
- **Code**: the real files, served as static JSON by `app/source/[id]` from the folder.
- **How it works**: `howItWorks`.
- **Copy prompt**: files, install, usage and notes in one message for an AI assistant.

Reference: `components/blocks/rolling-counter`.

## The registry
`app/r/[item]` serves each free component as a shadcn registry item (`/r/<id>.json`), and
`app/r/registry.json` lists them all. Both read `BLOCK_METAS` in `lib/ui/metas.ts` and the
files from disk, and are built as static JSON. `NEXT_PUBLIC_SITE_URL` sets the address the
install commands use (empty: the address the page is opened on). Tested end to end: a fresh
Next.js + shadcn project installs the rolling counter and builds.

## Publishing
1. Add the component's meta to `BLOCK_METAS` in `lib/ui/metas.ts` (free components only).
2. Add its `UiBlock` (from `index.ts`) to `PUBLISHED` in `lib/ui/catalog.ts`.
`EXAMPLES` (the rolling counter) appear only in `npm run dev`, so the live wall stays empty
until real components are published. `UI_CATEGORIES` is a placeholder list.

Pro components: set `tier: "pro"`; free accounts see a lock instead of the Code tab, and
Pro accounts get the files from the API (`GET /components/:id/source`, returning
`{ files }`). Their source must not be committed to this public repo.

`lib/registry/categories` holds the earlier curated set (from the Studio-Rekt library),
written with Tailwind and not in this format. It is **not published**.

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
  browser). Everything else goes to the API (`apps/api`) through `api()` in `lib/api.ts`, which
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
