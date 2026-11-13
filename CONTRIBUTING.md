# Contributing

We welcome contributions to this project. By contributing, you agree to the
terms outlined below.

To run the console locally against a local dfe-engine, see
[docs/local-development.md](docs/local-development.md).

## Commit Message Format

HyperI projects use [Conventional Commits](https://www.conventionalcommits.org/)
and [semantic-release](https://semantic-release.gitbook.io/) for automated
versioning and changelog generation. All commits must follow this format:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                             | Version Bump  |
| ---------- | ------------------------------------------------------- | ------------- |
| `feat`     | A new feature                                           | Minor (0.X.0) |
| `fix`      | A bug fix                                               | Patch (0.0.X) |
| `docs`     | Documentation only                                      | None          |
| `style`    | Code style (formatting, semicolons, etc.)               | None          |
| `refactor` | Code change that neither fixes a bug nor adds a feature | None          |
| `perf`     | Performance improvement                                 | Patch (0.0.X) |
| `test`     | Adding or correcting tests                              | None          |
| `build`    | Changes to build system or dependencies                 | None          |
| `ci`       | Changes to CI configuration                             | None          |
| `chore`    | Other changes that don't modify src or test files       | None          |
| `revert`   | Reverts a previous commit                               | Varies        |

### Breaking Changes

For breaking changes that require a major version bump, add `!` after the type
or include `BREAKING CHANGE:` in the footer:

```text
feat!: remove deprecated API endpoints

BREAKING CHANGE: The /v1/users endpoint has been removed. Use /v2/users instead.
```

### Examples

```text
feat(auth): add OAuth2 support for Google login

fix(api): handle null response from upstream service

docs: update installation instructions for Windows

refactor(core)!: restructure module exports

BREAKING CHANGE: Named exports are now used instead of default exports.
```

### Scope

Scope is optional but recommended. Use it to indicate the area of the codebase
affected (e.g., `api`, `auth`, `core`, `cli`, `docs`).

## Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes that require users to modify their code
- **MINOR** (0.X.0): New features that are backwards-compatible
- **PATCH** (0.0.X): Bug fixes and minor improvements

Versions are automatically determined by semantic-release based on commit
messages. Do not manually update version numbers.

## Developer Certificate of Origin

This project uses the Developer Certificate of Origin (DCO) to ensure that
contributors have the right to submit their contributions.

By making a contribution to this project, you certify that:

1. The contribution was created in whole or in part by you and you have the
   right to submit it under the license indicated in the file; or

2. The contribution is based upon previous work that, to the best of your
   knowledge, is covered under an appropriate open source license and you
   have the right under that license to submit that work with modifications;
   or

3. The contribution was provided directly to me by some other person who
   certified (1), (2) or (3) and you have not modified it.

4. You understand and agree that this project and the contribution are public
   and that a record of the contribution (including all personal information
   you submit with it, including your sign-off) is maintained indefinitely
   and may be redistributed consistent with this project or the license(s)
   involved.

## How to Sign Off Your Commits

You must sign off each commit to indicate your acceptance of the DCO. Combine
the signoff with your conventional commit message:

```bash
git commit --signoff -m "feat(auth): add two-factor authentication"
```

This produces:

```text
feat(auth): add two-factor authentication

Signed-off-by: Your Name <your.email@example.com>
```

Make sure your Git configuration has your correct name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## License for Contributions

All contributions to this project are licensed under the Business Source
License 1.1 (BUSL-1.1), the same license that covers the project.

Each version of the software (including your contributions) will automatically
become available under the Apache License, Version 2.0 on the third
anniversary of its release.

## How to Contribute

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the commit message format above
3. **Sign off your commits** with the DCO
4. **Test your changes** to ensure they work as expected
5. **Submit a pull request** with a clear description of what you've done

### Pull Request Checklist

- [ ] Commits follow the conventional commit format
- [ ] All commits are signed off (DCO)
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated (if applicable)

## Run the checks locally before you push

HyperI projects gate every push through CI (lint, format, tests, secret scan,
dependency audit, build). Run the SAME checks locally first so your change lands
green instead of bouncing:

```bash
hyperi-ci check
```

`hyperi-ci` is the HyperI CI CLI (public on PyPI). If you do not have it, install
it once with `uv tool install hyperi-ci` (or `pipx install hyperi-ci`), or run it
ad hoc with `uvx hyperi-ci check`. It runs the project's full local validation --
the same suite CI runs -- and reports what to fix. Run it before every push and before opening a
pull request. It is the single best way to give your change the best chance of
surviving CI.

## CI/CD Workflow

When your pull request is merged to `main`:

1. **semantic-release** analyses commit messages since the last release
2. Determines the next version number based on commit types
3. Generates/updates the CHANGELOG
4. Creates a new GitHub release with release notes
5. Publishes the package (if applicable)

This happens automatically - no manual intervention required.

## Questions

If you have questions about contributing, please open an issue or contact us.

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
severity. The exposure model is declared once, in dfe-infra:
<https://github.com/hyperi-io/dfe-infra/blob/main/docs/threat-model.md>

### Where things live

| Path                                                                                               | Holds                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/dfe-core-ui`                                                                                 | the only workspace that ships -- Next standalone output                                                                                                |
| `src/app`                                                                                          | route groups `(auth)`, `(no-auth)`, plus unauthenticated `livez`, `readyz`, `metrics`                                                                  |
| `src/proxy.ts`                                                                                     | Next 16 middleware (renamed `middleware` -> `proxy`): auth guard, setup redirect, and the `dfe_token` cookie the dfe-hyperdx iframe authenticates with |
| `src/core/config/api`                                                                              | the one typed engine client, and the endpoint map compile-checked against the generated `paths`                                                        |
| `src/core/components/RbacProtected`                                                                | scope gating, for routes and for single buttons                                                                                                        |
| `src/{Apps,Hunts,Library,Platform,Rules,Schemas,Services,Settings,Sources,_FieldMaps,_Transforms}` | one directory per console domain, each with its own query hooks                                                                                        |
| `e2e/`                                                                                             | Playwright specs -- they drive a running console against a running engine                                                                              |
| `packages/dfe-engine-types/`                                                                       | the vendored engine specs, and the scope constants generated from the engine                                                                           |
| `packages/dfe-icons`                                                                               | SVG -> React codegen, `generate:check` is its drift gate                                                                                               |

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

### Running natively on a Mac, in VS Code

The console and the engine run as plain processes. The Rust apps stay in docker
or kind. To prove a machine, one command, one PASS or FAIL line and one log file
to paste back:

```bash
python3 scripts/macos-dev-smoke.py   # engine from ../dfe-engine, or DFE_ENGINE_DIR=<path>
uv run --no-project python scripts/macos-dev-smoke.py   # the same, under uv's Python
```

It wants `uv`, node 24 and a dfe-engine checkout beside this repo, and prints
what is missing with the install line. Docker (OrbStack or Docker Desktop) is
optional. With it the engine gets a local ClickHouse. Without it the pages that
read ClickHouse answer 503 and the rest work.

In VS Code, Run and Debug has an `Engine + Console` compound (`Engine + Console
(local ClickHouse)` when docker is up). It asks once for the engine checkout,
`../dfe-engine` by default. Run the `Engine: e2e seed (setup complete)` task,
then sign in at <http://localhost:3000> as `initial_user`. The password is the
engine's well-known e2e one (`_WELL_KNOWN_E2E_PASSWORD` in its
`api/e2e/seed/accounts.py`).

Two Mac traps. Point the console at `127.0.0.1:8003`, not `localhost`, because
Node resolves `localhost` to `::1` first and the engine listens on IPv4 only.
And leave ports 5000 and 7000 alone, macOS holds them for AirPlay Receiver.

The `macOS dev smoke` workflow runs the same script on a GitHub macOS arm64
runner. Dispatch it with an engine tag and a ui tag (or `main`) to gate a release
candidate. Any other ref is refused before a checkout.

### Running the e2e suite locally

Playwright drives a console that is already up, against an engine that is
already up. `playwright.config.ts` starts neither process, and `yarn test`
does not run these specs.

```bash
yarn workspace dfe-core-ui test:e2e:install          # Chromium, once
yarn workspace dfe-core-ui test:e2e                  # the folder, one worker
yarn workspace dfe-core-ui test:e2e --grep-invert @docker-only
```

Bring the console up the same way as
[local development](docs/local-development.md), on port 3000, with
`NEXT_PUBLIC_API_URL` and `INTERNAL_API_URL` pointed at the engine and
`NEXTAUTH_URL` matching the console. The suite defaults to
`http://localhost:3000` and `http://localhost:8003`. `BASE_URL` overrides the
console, and `NEXT_PUBLIC_API_URL` overrides the engine, falling back to `INTERNAL_API_URL`, then `http://localhost:8003`. Port
3000 is on the engine's default CORS allowlist, so login on another port fails
until that list is extended.

#### Engine: `make e2e-server`

The specs call helpers that only the e2e server mounts. From a dfe-engine
checkout:

```bash
cp .env.example .env     # once, if you have no .env yet
cp .env .env.e2e         # once; set DFE_ENGINE_ENV=test in .env.e2e
make e2e-server          # http://localhost:8003, DFE_ENGINE_E2E_SERVER=true
```

Each start wipes `tmp/e2e` and every ClickHouse database named `dfe_e2e*`,
then serves. `./config` and a dev stack's own databases stay put.
`E2E_KEEP=1 make e2e-server` reuses the last workspace. `make e2e-clean`
removes it and drops those databases.

ClickHouse has to answer the wipe. `.env.e2e` supplies
`DFE_ENGINE_CLICKHOUSE_USERNAME` and `DFE_ENGINE_CLICKHOUSE_PASSWORD` (the same password as
dfe-docker's `CLICKHOUSE_PASSWORD`, and an empty one is refused). If port 8003 is
already taken, usually by a `dfe-engine` container, stop that listener or run
`E2E_PORT=8004 make e2e-server` and point the console and the suite at that
port.

`GET /api/e2e/status` confirms the helpers. Every spec then POSTs
`/api/e2e/seed-static` with no auth, and the hooks call `reset_all`, which
wipes the seeded state. The engine's ready check is `GET /readyz`.

#### Engine: a deployed stack

A dfe-docker or cluster engine takes the same specs once it mounts the e2e
helpers. Both settings are needed, because the helpers refuse to mount, and
every seed call answers 500 (`e2e seed helpers require DFE_ENGINE_ENV=test`), unless
the environment is exactly `test`:

- `DFE_ENGINE_ENV=test`. `dev` is not enough. On dfe-docker it goes in `.env`.
- `DFE_ENGINE_E2E_SERVER=true`. On dfe-docker it goes in `env/engine.env`, which
  compose forwards to the engine container.

Point `BASE_URL` at the console and `NEXT_PUBLIC_API_URL` at the engine, as
above. A stack on non-default ports takes both, plus
`DFE_LOADER_METRICS_URL` and `DFE_RECEIVER_URL` for the specs that read the
loader and receiver directly.

The seeds fix two passwords. Every account `seed_setup_complete` and the
`seed_dfe_*` scripts make takes the engine's well-known e2e password, which
`E2E_ADMIN_PASSWORD` has to be (`_WELL_KNOWN_E2E_PASSWORD` in the engine's
`api/e2e/seed/accounts.py`). `admin` ends up on the password
`_SETUP_ADMIN_PASSWORD` in `api/e2e/seed/base.py`. `ingestRules.spec.ts` signs
in as `admin`, trying `E2E_ADMIN_PASSWORD` and then `E2E_ADMIN_NEW_PASSWORD`,
so `E2E_ADMIN_NEW_PASSWORD` is that second value when the whole folder runs in
one go. It is longer than 12 characters, as the engine requires.

The suite loads `apps/dfe-core-ui/.env.local`, then `.env`, and leaves any name
the shell already set alone. Put the acceptance-test names in `.env.local`.
They are listed in `apps/dfe-core-ui/.env.example`.

| Name                                                                 | Required for the folder                                                                                                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E2E_ADMIN_PASSWORD`                                                 | the password every seeded account logs in with. On a stack with the e2e helpers, the engine's well-known e2e password.                                                          |
| `E2E_ADMIN_NEW_PASSWORD`                                             | the password the suite changes an issued one to, and the one `ingestRules.spec.ts` tries for `admin` after the seeds. At least 12 characters, or the engine refuses the change. |
| `DFE_OIDC_FIXTURE_PASSWORD`                                          | OIDC login only. A provider with no password is skipped. The user defaults to `dfe-test@dfe-oidc.test`.                                                                         |
| `E2E_TEST_TIMEOUT_MS`, `E2E_EXPECT_TIMEOUT_MS`, `E2E_NAV_TIMEOUT_MS` | optional. Unset keeps 120000, 5000 and 0. The test budget covers `reset_all` in `beforeEach`. Raise them when the stack is slower than local docker.                            |

Specs tagged `@docker-only` (`filebeatDataPath.spec.ts`,
`promoteJsonField.spec.ts`, and the Compose scaling case in
`components.spec.ts`) shell out to `docker`. They need a docker daemon and the
stack's containers. `DFE_CONTAINER_PREFIX` defaults to `e2e-`, and a dfe-docker
checkout names containers after their compose services, so set the prefix
empty there. `DFE_DOCKER_DIR` is that checkout, so `make apply` can create a
container the suite just asked for. `DFE_FILEBEAT_CORPUS` is the filebeat
archive, and those corpus cases skip when it is unset. `library.spec.ts` and
`sourcesProcessing.spec.ts` are refused by a docker-slim engine that does not
offer `dfe-fetcher`.

Leave `fullyParallel: false` and `workers: 1`. The specs share one engine.

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
own. The second edge is derived: `packages/dfe-engine-types/scopes/index.ts` is
written from the `RbacScope` enum in that spec by
`yarn workspace @repo/dfe-engine-types generate`. A hand edit to either is
drift.

**dfe-ui -> dfe-infra, outbound, lockstep.** dfe-infra's `dfe-ui` Helm chart
pins the container this repo publishes, as a tag plus the digest that makes the
tag immutable, and `check_versions_drift.py` holds the chart appVersion and the
digest mirror to that pin. It is the one repo a release here moves.

**dfe-hyperdx, runtime only.** `/observe` iframes the fork on its own
subdomain, which authenticates the operator from the `dfe_token` cookie
`src/proxy.ts` plants on the shared parent domain (`DFE_COOKIE_DOMAIN`). The
suite graph declares no build edge -- nothing here is generated from that repo
or pinned to it.
