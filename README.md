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

On a system-installed node (`/usr/bin/node`) `corepack enable` fails with
`EACCES` on its symlink. Either `corepack enable --install-directory
~/.local/bin` (any writable directory on your PATH), or prefix each command
with `corepack ` -- `corepack yarn install` -- which needs no enable. A yarn 1
already on your PATH is the wrong yarn for this lockfile.

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

| Doc                                                          | Covers                                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)                 | app + package map, route groups, where dfe-ui sits in the DFE stack          |
| [docs/console-and-the-flow.md](docs/console-and-the-flow.md) | the five menu groups, and how a source page draws the engine's flow resolver |
| [docs/engine-api-client.md](docs/engine-api-client.md)       | the typed engine API seam + spec re-vendor procedure                         |
| [docs/authentication.md](docs/authentication.md)             | credentials login vs proxy-trust mode                                        |
| [docs/observe-embed.md](docs/observe-embed.md)               | the embedded HyperDX explore surface                                         |
| [docs/build-and-deploy.md](docs/build-and-deploy.md)         | standalone build, container, publish                                         |
| [docs/local-development.md](docs/local-development.md)       | toolchain, env vars, tests, storybook                                        |

## License

Licensed under BUSL-1.1 - see [LICENSE](LICENSE).

## Context

### What this is

The operator console: a Next.js app that reads and writes through one backend,
the dfe-engine API, and iframes the dfe-hyperdx fork for data exploration. It
keeps no datastore. When the console needs data the engine grows an endpoint,
rather than the UI reaching past it.

Not an internal tool. Other organisations run this console against their own
engine, so cluster names, our fleet and credential paths belong in the private
config repos. One artifact ships, the `ghcr.io/hyperi-io/dfe-ui` container.

This repo and dfe-receiver are the two components in the suite that take
untrusted input, so an advisory here is graded on reachability before
severity. The exposure model is declared once, in dfe-infra
`docs/THREAT-MODEL.md`.

### Where things live

| Path                                                                                               | Holds                                                                                                                                              |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/dfe-core-ui`                                                                                 | the only workspace that ships -- Next standalone output                                                                                            |
| `src/app`                                                                                          | route groups `(auth)`, `(no-auth)`, plus unauthenticated `livez`, `readyz`, `metrics`                                                              |
| `src/proxy.ts`                                                                                     | Next 16 middleware (renamed `middleware` -> `proxy`): auth guard, setup redirect, and the `dfe_token` cookie the HyperDX iframe authenticates with |
| `src/core/config/api`                                                                              | the one typed engine client, and the endpoint map compile-checked against the generated `paths`                                                    |
| `src/core/components/RbacProtected`                                                                | scope gating, for routes and for single buttons                                                                                                    |
| `src/{Apps,Hunts,Library,Platform,Rules,Schemas,Services,Settings,Sources,_FieldMaps,_Transforms}` | one directory per console domain, each with its own query hooks                                                                                    |
| `e2e/`                                                                                             | Playwright specs -- they drive a running console against a running engine                                                                          |
| `packages/dfe-engine-types/`                                                                       | the vendored engine specs, and the scope constants generated from the engine                                                                       |
| `packages/dfe-icons`                                                                               | SVG -> React codegen, `generate:check` is its drift gate                                                                                           |

Paths under `apps/dfe-core-ui/` are shown relative to it.

### Commands that prove a change

```bash
yarn lint                            # eslint only -- it does NOT typecheck
yarn check-types                     # tsc --noEmit, a separate turbo task
yarn test                            # vitest run, apps/dfe-core-ui only
yarn build                           # next build -- catches what `yarn dev` will not
yarn format:check                    # prettier over the tree, README included
yarn check:icons                     # icon codegen drift
make check                           # hyperi-ci check, what CI runs
yarn workspace dfe-core-ui test:e2e  # Playwright, needs a console and an engine up
```

Four ways green lies here:

- `yarn test` never runs the Playwright specs. vitest's `include` is
  `src/**/*.test.{ts,tsx}`, the specs live in `e2e/`, and `apps/dfe-core-ui`
  is the only workspace with a `test` script.
- `playwright.config.ts` sets no `webServer`, so `test:e2e` with nothing
  running fails on the connection, not on your change.
- the audit is `warn` in `.hyperi-ci.yaml`, because npm's advisories endpoint
  times out from every runner the build uses (#210). Dependabot carries the
  advisories instead.
- a failed Commit messages job skips Test, Quality, Build and Release outright
  (#209), so a red main can mean nothing ran.

### What tends to bite

| Don't                                                                         | Do                                                                        | Why                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hand-patch a generated type to add a field the vendored spec lacks            | re-vendor the spec, then `yarn workspace @repo/dfe-engine-types generate` | #298: a patch marked "not yet in the vendored spec" kept a stale spec alive after the engine made the field required                                             |
| re-derive what the engine already declares -- a picker's options, a name rule | read the engine's list, carry the engine's rule                           | #287, the engine picker was hardcoded and offered an engine that does not exist. #218, the form allowed `aws_cloudtrail` where the engine wants a DNS-1123 label |
| put a health or metrics route behind `withAuth`                               | keep `livez`, `readyz`, `metrics` in the `proxy.ts` matcher exclusions    | probes carry no session, so `withAuth` returned 307 to `/login`. Kubernetes counts 3xx as success, so probes passed while the app was face down                  |
| read a failed engine call as a completed state                                | tell a broken config apart from an unreachable engine                     | #236, `proxy.ts` treated a failed setup-status call as setup complete                                                                                            |
| run the Playwright specs in parallel                                          | leave `fullyParallel: false` and `workers: 1`                             | every spec shares one engine and calls `reset_all`. Workers race on seed-static, so a spec passes alone and hangs with the folder                                |
| add a per-file timeout when a `findBy` backstop expires                       | rely on the global `testTimeout: 20_000`                                  | four suites died at vitest's 5s default on 4cpu runners, carrying 15s backstops the per-test budget beheads                                                      |
| merge a `feat:` with the GitHub squash button                                 | default to `fix:`                                                         | #209, the validator wants `HYPERCI_ALLOW_FEAT=1` set at commit time and the squash button has no environment. Main was red from 2026-09-03                       |

### Where this sits

Both edges are declared data -- read them with
`dfe-stack suite --consumer dfe-ui` and `--producer dfe-ui`.

**dfe-engine -> dfe-ui, inbound.** Two edges. This repo commits a byte copy of
the engine's `openapi-spec/openapi.json`, so drift is measurable by hashing
both copies, and dfe-engine's Sync dfe-engine-types workflow re-vendors it by
pull request on a push to its main -- an engine API change arrives here on its
own. The second edge is generated: `packages/dfe-engine-types/scopes/index.ts`,
whose header names the engine module. A hand edit to either is drift.

**dfe-ui -> dfe-infra, outbound, lockstep.** dfe-infra's `dfe-ui` Helm chart
pins the container this repo publishes, as a tag plus the digest that makes the
tag immutable, and `check_versions_drift.py` holds the chart appVersion and the
digest mirror to that pin. It is the one repo a release here moves.

**dfe-hyperdx, runtime only.** `/observe` iframes the fork on its own
subdomain, which authenticates the operator from the `dfe_token` cookie
`src/proxy.ts` plants on the shared parent domain (`DFE_COOKIE_DOMAIN`). The
suite graph declares no build edge -- nothing here is generated from that repo
or pinned to it.
