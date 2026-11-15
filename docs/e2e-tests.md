# Running the e2e suite

Playwright drives a console that is already up, against an engine that is already up. `apps/dfe-core-ui/playwright.config.ts` starts neither process (it sets no `webServer`), and `yarn test` does not run these specs.

```bash
yarn workspace dfe-core-ui test:e2e:install          # Chromium, once
yarn workspace dfe-core-ui test:e2e                  # the folder, one worker
yarn workspace dfe-core-ui test:e2e --grep-invert @docker-only
```

Bring the console up the same way as [local development](local-development.md), on port 3000, with `NEXT_PUBLIC_API_URL` and `INTERNAL_API_URL` pointed at the engine and `NEXTAUTH_URL` matching the console. The suite reads the console from `BASE_URL`, then `NEXTAUTH_URL`, then `http://localhost:3000`, and the engine from `NEXT_PUBLIC_API_URL`, then `INTERNAL_API_URL`, then `http://localhost:8003` (`apps/dfe-core-ui/e2e/config/e2e.client.ts`). Port 3000 is on a dev engine's fallback CORS allowlist, so login on another port fails until that list is extended.

## The engine has to mount the e2e helpers

The specs call helpers only the e2e server mounts. From a dfe-engine checkout:

```bash
cp .env.e2e.example .env.e2e   # once, it already sets DFE_ENGINE_ENV=test
make e2e-server                # http://localhost:8003, DFE_ENGINE_E2E_SERVER=true
```

Each start wipes `tmp/e2e` and every ClickHouse database named `dfe_e2e*`, then serves. `E2E_KEEP=1 make e2e-server` reuses the last workspace, and `make e2e-clean` removes it and drops those databases. ClickHouse has to answer the wipe, so `.env.e2e` supplies `DFE_ENGINE_CLICKHOUSE_USERNAME` and `DFE_ENGINE_CLICKHOUSE_PASSWORD` (against a dfe-docker ClickHouse, the same password as its `CLICKHOUSE_PASSWORD`). If port 8003 is taken, usually by a `dfe-engine` container, stop that listener or run `E2E_PORT=8004 make e2e-server` and point the console and the suite at that port.

`GET /api/e2e/status` confirms the helpers. Every spec then POSTs `/api/e2e/seed-static` with no auth, and the hooks run `reset_all`. That deletes every account and organisation on the engine, not only what the suite seeded, then puts back the local admin and `breakglass` (`src/dfe_engine/api/e2e/seed/base.py` in dfe-engine). It also clears the sources, rules, hunts, schemas, library artefacts and app instances its seeders reach. Some rules, hunts and schemas written through the console outlive it, so `tenantFence.spec.ts` and `commonHeaders.spec.ts` remove their own first, and a clean run needs a fresh engine. The engine's ready check is `GET /readyz`.

Run the suite only against a disposable engine and datastore. The helpers take no auth, so anyone who can reach an engine with them mounted can wipe it.

A disposable dfe-docker or cluster engine takes the same specs once it mounts the helpers. Both settings are needed, because the helpers refuse to mount, and every seed call answers 500 (`e2e seed helpers require DFE_ENGINE_ENV=test`), unless the environment is exactly `test`:

- `DFE_ENGINE_ENV=test`. `dev` is not enough. On dfe-docker it goes in `.env`.
- `DFE_ENGINE_E2E_SERVER=true`. On dfe-docker it goes in `env/engine.env`, which compose forwards to the engine container.

Point `BASE_URL` at the console and `NEXT_PUBLIC_API_URL` at the engine. A stack on non-default ports also takes `DFE_LOADER_METRICS_URL` and `DFE_RECEIVER_URL` for the specs that read the loader and receiver directly.

## Two passwords, and the names in `.env.local`

Every account `seed_setup_complete` and the `seed_dfe_*` scripts make takes the engine's well-known e2e password (`_WELL_KNOWN_E2E_PASSWORD` in dfe-engine's `src/dfe_engine/api/e2e/seed/accounts.py`), which `E2E_ADMIN_PASSWORD` has to be. `seed_setup_complete` moves `admin` to `_SETUP_ADMIN_PASSWORD` (`src/dfe_engine/api/e2e/seed/base.py`), so specs that run after it, `ingestRules.spec.ts` among them, sign in as `initial_user`, who keeps the suite password.

The suite loads `apps/dfe-core-ui/.env.local`, then `.env`, and leaves any name the shell already set alone. Put the acceptance-test names in `.env.local`. `apps/dfe-core-ui/.env.example` lists them.

| Name                                                                 | Required for the folder                                                                                                                                   |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E2E_ADMIN_PASSWORD`                                                 | the password seeded accounts sign in with. Falls back to `DFE_ENGINE_AUTH_LOCAL_ADMIN_PASSWORD`. On a stack with the e2e helpers, the well-known e2e one. |
| `E2E_ADMIN_NEW_PASSWORD`                                             | the password the suite changes an issued one to at the forced first-login change. At least 12 characters, or the engine refuses the change.               |
| `DFE_OIDC_FIXTURE_PASSWORD`                                          | OIDC login only. A provider with no password is skipped. The user defaults to `dfe-test@dfe-oidc.test`.                                                   |
| `E2E_TEST_TIMEOUT_MS`, `E2E_EXPECT_TIMEOUT_MS`, `E2E_NAV_TIMEOUT_MS` | optional. Unset keeps 120000, 5000 and 0. The test budget covers `reset_all` in `beforeEach`. Raise them when the stack is slower than local docker.      |

Some specs need more than the engine.

Specs tagged `@docker-only` (`filebeatDataPath.spec.ts`, `promoteJsonField.spec.ts`, and the Compose scaling case in `components.spec.ts`) shell out to `docker`, so they need a docker daemon and the stack's containers. `DFE_CONTAINER_PREFIX` defaults to `e2e-`, and a dfe-docker checkout names containers after their compose services, so set the prefix empty there. `DFE_DOCKER_DIR` is that checkout, so `make apply` can create a container the suite just asked for. `DFE_FILEBEAT_CORPUS` is the filebeat archive, and those corpus cases skip when it is unset.

`e2e/specs/library.spec.ts` and `sourcesProcessing.spec.ts` seed a fetcher source, which a docker-slim engine refuses because that tier does not offer `dfe-fetcher`.

Leave `fullyParallel: false` and `workers: 1`. The specs share one engine, and workers race on `seed-static`.

Green lies here in two ways. `yarn test` never runs the Playwright specs: vitest collects `*.test.ts(x)` under `src/` and `eslint/`, the specs live in `e2e/`, and `apps/dfe-core-ui` is the only workspace with a `test` script. And `test:e2e` with nothing running fails on the connection, not on your change.
