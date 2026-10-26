# rektui

Add [Rekt UI](https://github.com/tenilmurat/rektui-frontend) components to your project with one command.

```bash
npx rektui@latest add rolling-counter
```

Each component is two plain files, a `.tsx` and a `.css`, copied into your project, so they're yours to read and change. No runtime package and no lock-in.

## Commands

```bash
npx rektui add <component…>   # copy one or more components into your project
npx rektui list               # see every component
```

| Option | |
|---|---|
| `--dir <path>` | put the files somewhere other than `components/rekt-ui/` |
| `--overwrite` | replace files you already have |
| `-y, --yes` | don't ask; files you changed are kept |
| `--dry-run` | show what would change, write nothing |
| `--no-install` | don't install npm dependencies |
| `--registry <url>` | use another registry (or set `REKTUI_REGISTRY`) |

## What it does

1. Fetches the component from the Rekt UI registry (`<site>/r/<name>.json`, shadcn's registry format).
2. Writes its files to your components folder under `rekt-ui/`:
   - `src/components/rekt-ui/` when your project uses `src/`, else `components/rekt-ui/`
   - follows shadcn's `components.json` when there is one
3. Asks before replacing a file you've changed.
4. Installs any npm packages it needs, with your package manager (npm, pnpm, yarn or bun, from your lockfile).
5. Prints the import lines, using your `@/` alias from `tsconfig.json` when you have one.

No dependencies of its own; it needs Node 18.17 or newer. Works in any React project: Next.js, Vite, Remix and others.

## Pro components

Set `REKTUI_TOKEN` to your Rekt UI key and Pro components install the same way.

## Development

```bash
npm install
npm test            # unit tests (node --test)
npm run typecheck   # JSDoc types, checked by TypeScript
REKTUI_REGISTRY=http://localhost:3500 node bin/rektui.js add rolling-counter
```

## Publishing checklist

1. Set `DEFAULT_REGISTRY` in `src/registry.js` to the live site, e.g. `https://rektui.com`.
2. `npm whoami`, with two-factor authentication on for the account.
3. `npm publish --access public` (the first publish reserves the name `rektui`).
4. In rektui-frontend, set `NEXT_PUBLIC_REKTUI_CLI=1` (a build variable in Coolify): the
   Install section then leads with `npx rektui@latest add <name>`.
