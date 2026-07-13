# Local development

Node >= 24 with corepack (yarn 4), turbo drives the workspaces. The app
expects a reachable dfe-engine API - point `NEXT_PUBLIC_API_URL` at one
(a local `uv run dfe-engine` in the engine repo works).

## Setup and daily loop

```bash
corepack enable
yarn install
yarn dev          # turbo dev - app on http://localhost:3000
yarn test         # vitest across workspaces
yarn lint         # eslint via turbo
```

Storybook (icon + component workbench):

```bash
yarn workspace @repo/dfe-icons storybook
```

## Environment variables

| Variable | When | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | build-time inlined | engine API base URL |
| `DFE_AUTH_MODE` | runtime | `proxy` enables proxy-trust sign-in ([authentication.md](authentication.md)) |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | runtime | NextAuth session config |
| `NEXT_PUBLIC_HYPERDX_URL` + `HYPERDX_PORT` | mixed | the embed pair - see [observe-embed.md](observe-embed.md) |

`NEXT_PUBLIC_*` values are baked in at build time - changing them needs a
rebuild, not a restart.

## Regenerating engine types

After any engine API change, re-vendor the spec and regenerate - the
procedure is in [engine-api-client.md](engine-api-client.md).
