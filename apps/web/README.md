# rektui-frontend

The website for **Rekt UI**: a curated library of interface and motion components,
"Good designs of X", and Pro plans. The API lives in
[rektui-backend](https://github.com/tenilmurat/rektui-backend).

**Stack:** Next.js 16 · React 19 · Tailwind v4 · Supabase Auth (sign-in only) · Paddle.js (checkout)

## Pages

| Path | What it is |
|---|---|
| `/` → `/<category>` | **UI**: component categories, live previews, code panel, bookmarks |
| `/create/<tool>` | Rekt's own tools |
| `/good-designs?x=<id>` | **Good designs of X**: curated real-world work |
| `/pricing` | Free · Pro (yearly) · Lifetime, Paddle checkout |
| `/saved` | Bookmarked components and designs |
| `/account` | Plan, billing portal, sign out, delete account |

## Setup

```bash
npm install
cp .env.example .env.local   # API URL, Supabase publishable key, Paddle client token
npm run dev                  # http://localhost:3500
```

With no environment set, the site runs signed out and every page still works.

```bash
npm run typecheck
npm run build
```

## Deploy (Coolify)

Dockerfile build, port 3000. Every variable is `NEXT_PUBLIC_*`, baked in at build time,
so add them as **build variables**.

Conventions for adding components, tools and Pro items are in [AGENTS.md](AGENTS.md).
