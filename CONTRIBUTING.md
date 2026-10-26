# Contributing to Rekt UI

Thanks for wanting to help. Ideas, bug reports and new components are all welcome.

## How changes get in

Only the maintainer can change this repository. Everyone else works through a pull request:

1. **Fork** the repository and create a branch from `main`.
2. Make your change and run `npm run check`.
3. Open a **pull request** against `main` and fill in the template.
4. The maintainer reviews it. Nothing reaches `main` without that review and passing checks; `main` can't be force-pushed or deleted.

For anything larger than a small fix, open an issue first so we can agree on the idea before you build it.

## Run it locally

```bash
npm run setup
npm run dev:web     # http://localhost:3500 — shows the dev-only examples too
```

## Adding a component

A component is a folder in `apps/web/components/blocks/<id>/` holding exactly what a user takes home, plus two small files that describe it for the site:

```
components/blocks/<id>/
  <Name>.tsx   "use client", a named export <Name>, typed props that all have defaults
  <Name>.css   plain CSS, class prefix rk-<short>-, colours as --rk-<short>-* variables
               with fallbacks, prefers-reduced-motion handled
  meta.ts      title, description, category, controls, how it works (plain data)
  index.ts     meta + the component + its CSS import
```

Copy [`rolling-counter`](apps/web/components/blocks/rolling-counter) and change it. Then add the meta to `BLOCK_METAS` in `apps/web/lib/ui/metas.ts` and the block to `EXAMPLES` in `apps/web/lib/ui/catalog.ts`; the maintainer moves it to `PUBLISHED`.

What makes a component a good fit:

- **Self-contained.** No imports from the site, no Tailwind, no packages unless they earn their place (list them in `dependencies`).
- **Tunable.** One control per prop that changes how it looks or feels.
- **Accessible.** Keyboard works, focus is visible, screen readers get a sensible name, reduced motion is respected.
- **Yours to give.** Written by you, not copied from another library.

## Your contribution and its licence

By opening a pull request you confirm that the work is yours to contribute, and you agree that Rekt UI may use, change and distribute it as part of Rekt UI — in free and in Pro components, and under the licence the project uses for them. You keep the right to use your own work elsewhere.

## Never commit

- Secrets or keys (`.env` files are ignored; use `.env.example` for names only).
- Source code of Pro components — it lives in the API's database, not in git.
