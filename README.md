# Rekt UI

Interface and motion components you can see live, tune, and take straight into your own React project — each one a plain `.tsx` and `.css`, nothing to lock you in.

```bash
npx rektui add tilt-card
```

## What's in this repository

| Folder | What it is | Stack |
|---|---|---|
| [`apps/web`](apps/web) | The website: the UI wall, Good designs of X, Pricing, accounts, and the component registry (`/r/<id>.json`) | Next.js 16, React 19, Tailwind v4 |
| [`apps/api`](apps/api) | The API: accounts, bookmarks, Paddle billing and Pro source | NestJS 12, Supabase |
| [`packages/cli`](packages/cli) | The `rektui` command that installs components | Node, no dependencies |

Each folder is its own project — its own `package.json`, lockfile and Dockerfile — so each deploys on its own.

## Run it locally

Node 24 (see `.nvmrc`).

```bash
npm run setup      # installs all three
npm run dev:web    # http://localhost:3500
npm run dev:api    # http://localhost:4000
npm run check      # typecheck, tests and builds for everything
```

The site runs without any environment set (signed out, accounts off). To sign in and pay, copy each app's `.env.example` to `.env.local` / `.env` and fill in Supabase and Paddle.

## Adding a component

Every component is a folder in `apps/web/components/blocks/<id>/`: one `.tsx`, one `.css`, a `meta.ts` and an `index.ts`. [`rolling-counter`](apps/web/components/blocks/rolling-counter) is the reference. The full guide is in [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Please report vulnerabilities privately — see [SECURITY.md](SECURITY.md).
