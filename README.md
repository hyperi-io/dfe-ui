# dfe-ui

The DFE console, where an operator sets up and runs a deployment.

[![Build Status](https://github.com/hyperi-io/dfe-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/hyperi-io/dfe-ui/actions)
[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL--1.1-blue)](LICENSE)

It manages the deployment through the dfe-engine API alone, never past it to the infrastructure. Its Observe pages are served from a separate URL and framed inside the console, and the console sends its telemetry to an OTLP endpoint when `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

## What it does

- Sources and their ingest rules, defined in one place.
- Schemas and meta schemas, transforms, field maps and the library they draw on.
- Detection rules and hunts.
- An Observe view for searching and charting the data.
- Platform and admin settings, and a first-run setup flow.

## Quick start

```bash
corepack enable          # yarn 4, node >= 24
yarn install
yarn dev                 # turbo dev - app on http://localhost:3000
```

On a system-installed node (`/usr/bin/node`) `corepack enable` fails with
`EACCES` on its symlink. Either `corepack enable --install-directory
~/.local/bin` (any writable directory on your PATH), or prefix each command
with `corepack` -- `corepack yarn install` -- which needs no enable. A yarn 1
on your PATH is the wrong yarn for this lockfile.

Point it at an engine with `NEXT_PUBLIC_API_URL` and `INTERNAL_API_URL`. With neither set, every page says the engine URL is not configured.
Full environment reference: [docs/local-development.md](docs/local-development.md).

## What's inside

A Turborepo/yarn-workspaces monorepo with one shipped app and six packages:

| Workspace                     | What it is                                                        |
| ----------------------------- | ----------------------------------------------------------------- |
| `apps/dfe-core-ui`            | the Next.js app - the one artifact shipped (standalone container) |
| `packages/dfe-engine-types`   | a committed copy of the engine's OpenAPI specs + generated types  |
| `packages/dfe-icons`          | SVG -> React icon codegen + storybook                             |
| `packages/dev-logger`         | small shared logging helper                                       |
| `packages/dfe-json-viewer-cn` | the JSON viewer component                                         |
| `packages/dfe-shared-ui`      | shared React components and utilities                             |
| `packages/typescript-config`  | shared tsconfigs                                                  |

## Documentation

| Doc                                                              | Covers                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)                     | app + package map, route groups, where dfe-ui sits in the DFE stack          |
| [docs/console-and-the-flow.md](docs/console-and-the-flow.md)     | the four menu groups, and how a source page draws the engine's flow resolver |
| [docs/engine-api-client.md](docs/engine-api-client.md)           | the typed engine API client and how the engine spec is synced                |
| [docs/authentication.md](docs/authentication.md)                 | local and OIDC sign-in, session renewal, sign-out and redirects              |
| [docs/observe-embed.md](docs/observe-embed.md)                   | how the Observe pages are framed in the console                              |
| [docs/build-and-deploy.md](docs/build-and-deploy.md)             | standalone build, container, publish                                         |
| [docs/local-development.md](docs/local-development.md)           | toolchain, env vars, tests, storybook, running natively on a Mac             |
| [apps/dfe-core-ui/e2e/README.md](apps/dfe-core-ui/e2e/README.md) | running the Playwright suite against a console and an engine                 |

The suite's published docs are at <https://dfe.docs.hyperi.io>, and this repository's pages at <https://dfe.docs.hyperi.io/dfe-ui/>.

## Help and contributing

How to work in this repo, the commands that prove a change and what tends to bite are in [CONTRIBUTING.md](CONTRIBUTING.md). A question that is not a bug goes in an issue as well.

Open bugs: [this repo](https://github.com/hyperi-io/dfe-ui/issues?q=is%3Aopen+is%3Aissue+type%3ABug+-label%3Abacklog+-label%3Anext-minor) | [whole DFE suite](https://github.com/search?type=issues&q=is%3Aopen+is%3Aissue+type%3ABug+-label%3Abacklog+-label%3Anext-minor+repo%3Ahyperi-io%2Fdfe-infra+repo%3Ahyperi-io%2Fdfe-docker+repo%3Ahyperi-io%2Fdfe-deploy+repo%3Ahyperi-io%2Fdfe-engine+repo%3Ahyperi-io%2Fdfe-loader+repo%3Ahyperi-io%2Fdfe-receiver+repo%3Ahyperi-io%2Fdfe-fetcher+repo%3Ahyperi-io%2Fdfe-archiver+repo%3Ahyperi-io%2Fdfe-transform-vrl+repo%3Ahyperi-io%2Fdfe-transform-vector+repo%3Ahyperi-io%2Fdfe-transform-elastic+repo%3Ahyperi-io%2Fdfe-ui+repo%3Ahyperi-io%2Fdfe-hyperdx+repo%3Ahyperi-io%2Fscalo-rs+repo%3Ahyperi-io%2Fscalo-py+repo%3Ahyperi-io%2Flogreducer+repo%3Ahyperi-io%2Fdfe-schemas+repo%3Ahyperi-io%2Fvector-vrl+repo%3Ahyperi-io%2Fculvert+repo%3Ahyperi-io%2Fdfe-clickhouse-rs+repo%3Ahyperi-io%2Ffactbook-rs)

## License

BUSL-1.1, see [LICENSE](LICENSE).
