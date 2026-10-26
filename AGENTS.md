# Rekt UI — monorepo

Rekt UI is its own product, sold on its own — not part of Rekt Studio. Don't bring
Rekt Studio branding, logos or links in.

| Folder | What | Guide |
|---|---|---|
| `apps/web` | Next.js site + component registry | `apps/web/AGENTS.md` |
| `apps/api` | NestJS API (accounts, bookmarks, billing, Pro source) | `apps/api/README.md` |
| `packages/cli` | `rektui` npm package | `packages/cli/README.md` |

Each folder is independent: its own `package.json`, lockfile and Dockerfile, so Coolify
builds each from its own folder (set the resource's base directory to it and its watch
paths to `<folder>/**`). No npm workspaces on purpose: a shared root lockfile would break
those per-folder Docker builds. Root scripts (`npm run setup`, `dev:web`, `dev:api`,
`check`) just call into each folder.

## Rules
- The repo is public. Never commit secrets (`.env*` is ignored; `.env.example` holds names
  only) or Pro component source (it lives in the API's `component_sources` table).
- `main` is protected: changes arrive by pull request; no force-push, no deletion.
- GitHub Actions are pinned to full commit SHAs; keep it that way when updating them.
- Run `npm run check` before pushing.
