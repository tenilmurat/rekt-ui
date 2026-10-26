# Rekt UI — API (`apps/api`)

The API behind [the website](../web):
accounts, bookmarks, billing and Pro component source.

**Stack:** Node.js 24 · NestJS 12 · TypeScript · Supabase (Postgres + Auth) · Paddle (merchant of record)

## Endpoints

| Method | Path | Auth | What it does |
|---|---|---|---|
| GET | `/health` | — | Health check for Coolify |
| GET | `/me` | Bearer | Account, plan and bookmarks in one call |
| PUT | `/bookmarks/:kind/:id` | Bearer | Save a `component` or `design` |
| DELETE | `/bookmarks/:kind/:id` | Bearer | Remove it |
| POST | `/billing/portal` | Bearer | One-time link to Paddle's customer portal |
| POST | `/billing/webhook` | Paddle signature | Records plans from Paddle events |
| DELETE | `/account` | Bearer | Cancels a renewing plan, then deletes the account |
| GET | `/components/:id/source` | Bearer + Pro | Pro component source |

`Bearer` is the Supabase access token the frontend gets at sign-in. The guard
(`src/auth/auth.guard.ts`) checks it with Supabase before any handler runs.

## How data is protected

- Row-level security is on for every table. User requests go through
  `SupabaseService.forUser(token)`, so the database itself only returns that user's rows.
- `SupabaseService.admin` (secret key) is used only for the webhook, account deletion
  and Pro source.
- **Pro source is never in git.** Both repos are public; Pro code lives in the
  `component_sources` table, which has RLS on and no policies, so only this API can read it.

## Setup

```bash
npm install
cp .env.example .env   # fill in Supabase and Paddle
npm run start:dev      # http://localhost:4000
```

Run `supabase/migrations/*.sql` in order in the Supabase SQL editor.

```bash
npm test          # unit tests
npm run test:e2e  # HTTP tests
npm run build
```

## Deploy (Coolify)

Dockerfile build, port 3000 inside the container, health check `/health`. Set the
variables from `.env.example` in the resource's environment, and point Paddle's
notification destination at `https://<api domain>/billing/webhook`.

## Dependency notes

- `overrides.multer` in `package.json` raises multer to `^2.5.0`: `@nestjs/platform-express`
  (12.0–12.2) pins `multer@2.4.0`, which has a denial-of-service advisory fixed in 2.5.0.
  Remove the override once Nest ships a version that depends on 2.5.0 or later.
