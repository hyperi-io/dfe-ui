# Engine API client - one typed client for every engine call

Feature code reaches the engine through one typed client generated from the engine's OpenAPI spec. The endpoint map is compile-time checked against the generated types, so a route that disappears from the spec fails the build, not the user.

## How the pieces connect

```mermaid
flowchart LR
    SPEC[packages/dfe-engine-types/specs/openapi.json<br/>copied from dfe-engine] -->|openapi-typescript| TYPES[generated paths types]
    TYPES --> MAP[API_CONFIG endpoint map<br/>satisfies keyof paths]
    MAP --> CLIENT[createApiClient]
    CLIENT --> HOOKS[TanStack Query hooks<br/>per feature dir]
```

- Engine spec: `packages/dfe-engine-types/specs/openapi.json` and `openapi.e2e.json`, committed byte copies of dfe-engine's `openapi/openapi.json` and `openapi/openapi.e2e.json`.
- Generated code: `yarn workspace @repo/dfe-engine-types generate` runs openapi-typescript over both specs (`types/index.d.ts`, `types/e2e.d.ts`) and writes the scope and limit constants (`scopes/index.ts`, `limits/index.ts`).
- Endpoint map: `apps/dfe-core-ui/src/core/config/api/endpoints/index.ts`, typed `satisfies Record<string, Record<string, keyof paths>>`, so every entry must exist in the spec.
- Client: `apps/dfe-core-ui/src/core/config/api/client.ts`, a fetch wrapper adding auth, JSON handling and `ApiError`.
- Hooks: feature directories wrap endpoints in TanStack Query.

## The engine opens the sync PR

A push to dfe-engine's main that changes either spec runs its Sync dfe-engine-types workflow (`.github/workflows/sync-dfe-engine-types.yml` in dfe-engine). It copies both specs here, runs `generate`, and opens a `sync-dfe-engine-types-<sha>` pull request, closing any older one. The compile errors that PR raises in the endpoint map are the drift check working.

To do the same by hand against a local engine checkout:

1. Copy dfe-engine's `openapi/openapi.json` and `openapi/openapi.e2e.json` over the two files in `packages/dfe-engine-types/specs/`.
2. `yarn workspace @repo/dfe-engine-types generate`
3. Fix any compile errors in the endpoint map.

The spec's `info.version` moves with every engine release, because each release commit rewrites `openapi/openapi.json`. A version comparison detects drift between releases but not edits within one, so compare the files. The type-safety sync is documented engine-side in [type-safety-sync.md](https://github.com/hyperi-io/dfe-engine/blob/main/docs/control-plane/type-safety-sync.md).
