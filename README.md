# DFE UI

[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL--1.1-blue)](LICENSE)

The web UI of the Data Fusion Engine (DFE) product suite. It consumes ONLY
the dfe-engine API (the control pyramid rule - the UI never reaches past the
API to the infrastructure), and embeds the DFE HyperDX fork as the
data-explore surface.

## Quick start

```bash
corepack enable          # yarn 4, node >= 24
yarn install
yarn dev                 # turbo dev - app on http://localhost:3000
```

Point it at an engine with `NEXT_PUBLIC_API_URL` (defaults suit local dev).
Full environment reference: [docs/local-development.md](docs/local-development.md).

## What's inside

A Turborepo/yarn-workspaces monorepo with one shipped app and four packages:

| Workspace                    | What it is                                                         |
| ---------------------------- | ------------------------------------------------------------------ |
| `apps/dfe-core-ui`           | the Next.js app - the only artifact shipped (standalone container) |
| `packages/dfe-engine-types`  | vendored engine OpenAPI spec + generated TypeScript types          |
| `packages/dfe-icons`         | SVG -> React icon codegen + storybook                              |
| `packages/dev-logger`        | small shared logging helper                                        |
| `packages/typescript-config` | shared tsconfigs                                                   |

## Documentation

| Doc                                                    | Covers                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)           | app + package map, route groups, where dfe-ui sits in the DFE stack |
| [docs/engine-api-client.md](docs/engine-api-client.md) | the typed engine API seam + spec re-vendor procedure                |
| [docs/authentication.md](docs/authentication.md)       | credentials login vs proxy-trust mode                               |
| [docs/observe-embed.md](docs/observe-embed.md)         | the embedded HyperDX explore surface                                |
| [docs/build-and-deploy.md](docs/build-and-deploy.md)   | standalone build, container, publish                                |
| [docs/local-development.md](docs/local-development.md) | toolchain, env vars, tests, storybook                               |

## License

Licensed under BUSL-1.1 - see [LICENSE](LICENSE).
