# Security

## Reporting a vulnerability

Please **don't open a public issue**. Use GitHub's private reporting instead: the repository's **Security** tab → **Report a vulnerability**. Only the maintainer can see it.

Include what you found, how to reproduce it, and what it could affect. You'll get a reply within a few days, and credit in the fix if you'd like it.

## Scope

- `apps/web` — the website and the component registry
- `apps/api` — accounts, bookmarks, billing, Pro source
- `packages/cli` — the `rektui` installer

## How the repository is protected

- Only the maintainer has write access; everyone else contributes through pull requests from forks.
- `main` can't be deleted or force-pushed, and changes reach it through reviewed pull requests with passing checks.
- `CODEOWNERS` makes the maintainer's review required for every file.
- Secret scanning with push protection, Dependabot alerts and security updates are on.
- Workflows from first-time and outside contributors need approval before they run, and workflow tokens are read-only by default.
- Third-party GitHub Actions are pinned to full commit SHAs.
