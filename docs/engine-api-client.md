# API client

The API client is the one typed client every engine call from feature code goes through, and is one part of [dfe-ui](architecture.md).

| Fact       | Value |
| ---------- | ----- |
| Repo       | `hyperi-io/dfe-ui`, `apps/dfe-core-ui/src/core/config/api` |
| Image      | `ghcr.io/hyperi-io/dfe-ui`, with the thin chart built from `deploy/contract.json` |
| Config     | `NEXT_PUBLIC_API_URL` for the browser and `INTERNAL_API_URL` for the server |
| Endpoints  | none of its own. It calls the dfe-engine API |
| Metrics    | the app's process metrics on `/metrics`, port 3000. Nothing specific to this part |

The endpoint map sits between the generated types and the client, so a route the spec drops fails compilation there.

```mermaid
---
config:
  theme: base
  look: neo
  fontFamily: Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif
  flowchart:
    curve: linear
    nodeSpacing: 40
    rankSpacing: 64
    padding: 18
    wrappingWidth: 280
    htmlLabels: true
  elk:
    preset: modelOrder
  themeVariables:
    fontSize: 15px
    lineColor: "#64748B"
    primaryTextColor: "#0F172A"
    nodeBorder: "#334155"
    clusterBorder: "#0072B2"
    edgeLabelBackground: "#FFFFFF"
  themeCSS: >-
    p{margin:0}
    .node[data-look] rect,.node[data-look] path,.node[data-look] polygon,.node[data-look] .outer-path{filter:drop-shadow(0 1px 2px rgba(15,23,42,.10)) drop-shadow(0 6px 14px rgba(15,23,42,.10))}
    .node rect{rx:10px;ry:10px}
    .cluster rect{rx:16px;ry:16px}
    .node .label div{min-width:150px}
    .node.decision .label div{min-width:0}
    .cluster[data-look] rect{filter:none}
    .nodeLabel{line-height:1.35}
    .nodeLabel b{font-weight:600;font-size:15px;letter-spacing:-0.01em}
    .nodeLabel span{font-size:12.5px;font-weight:400;color:#334155}
    .cluster-label span.nodeLabel{display:inline-block;background:#FFFFFF;color:#0B2A3F;border:1.5px solid #0072B2;border-radius:999px;padding:2px 12px;font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}
    .flowchart-link{stroke-width:1.75px}
    .labelBkg{background:transparent!important}
    span.edgeLabel{display:inline-block;background:#FFFFFF!important;color:#1E293B;border:1px solid #94A3B8;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:500}
    span.edgeLabel p{background:transparent!important}
    .label-icon{width:20px;height:20px;vertical-align:-4px;margin-right:6px}
    .icon-shape path[stroke-width="0"][fill="none"]{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:12px;stroke-linejoin:round}
    .icon-shape p{background:transparent!important;color:#0F172A}
    .ingest .label-icon{color:#0E8A7D}
    .xform .label-icon{color:#7B4FB0}
    .load .label-icon{color:#0072B2}
    .bus .label-icon{color:#A8517F}
    .store .label-icon{color:#00785A}
    .ui .label-icon{color:#D9480F}
    .ext .label-icon{color:#64748B}
---
flowchart TB
  accTitle: L4 Detail -- API client
  accDescr: openapi-typescript turns the copied engine spec into the paths types. The endpoint map is checked against those types, the API client sends requests from the map, and the TanStack Query hooks in each feature directory call the client.
  subgraph gen["Generated at build"]
    direction LR
    spec[("<b>Engine spec copy</b><br/><span>OpenAPI document</span>")]
    types("<b>Paths types</b><br/><span>from openapi-typescript</span>")
    spec --> types
  end
  subgraph run["Called at runtime"]
    direction LR
    map("<b>Endpoint map</b><br/><span>checked against types</span>")
    client("<b>API client</b><br/><span>sends from the map</span>")
    hooks("<b>Query hooks</b><br/><span>one per feature</span>")
    map -->|routes| client -->|calls| hooks
  end
  gen -->|types| run
  class spec store
  class types,map,client,hooks part
  class spec store
  class types,map,client,hooks part
  classDef ext fill:#F4F6F8,stroke:#94A3B8,stroke-width:1.5px,stroke-dasharray:5 4,color:#0F172A
  classDef ingest fill:#FFFFFF,stroke:#0E8A7D,stroke-width:3px,color:#0F172A
  classDef xform fill:#FFFFFF,stroke:#7B4FB0,stroke-width:3px,color:#0F172A
  classDef load fill:#FFFFFF,stroke:#0072B2,stroke-width:3px,color:#0F172A
  classDef bus fill:#FFFFFF,stroke:#A8517F,stroke-width:3px,color:#0F172A
  classDef store fill:#FFFFFF,stroke:#00785A,stroke-width:3px,color:#0F172A
  classDef ui fill:#FFFFFF,stroke:#D9480F,stroke-width:3px,color:#0F172A
  classDef decision fill:#FFFFFF,stroke:#9A6700,stroke-width:3px,color:#0F172A
  classDef error fill:#FFFFFF,stroke:#C2410C,stroke-width:3px,color:#0F172A
  classDef control fill:#FFFFFF,stroke:#334155,stroke-width:3px,color:#0F172A
  classDef part fill:#FFFFFF,stroke:#94A3B8,stroke-width:1.5px,color:#0F172A
  style gen fill:none,stroke:#0072B2,stroke-width:1.5px,stroke-dasharray:6 4
  style run fill:none,stroke:#0072B2,stroke-width:1.5px,stroke-dasharray:6 4
```

*Figure 1. L4 Detail -- API client. Feature code calls the engine through the client alone.* Up: [L3 Components -- dfe-ui](architecture.md).

Feature code reaches the engine through one typed client generated from the engine's OpenAPI spec. The endpoint map is compile-time checked against the generated types, so a route that disappears from the spec fails the build, not the user.

## The spec becomes typed calls

- Engine spec: `packages/dfe-engine-types/specs/openapi.json` and `openapi.e2e.json`, committed byte copies of dfe-engine's `openapi/openapi.json` and `openapi/openapi.e2e.json`.
- Generated code: `yarn workspace @repo/dfe-engine-types generate` runs openapi-typescript over both specs (`types/index.d.ts`, `types/e2e.d.ts`) and writes the scope and limit constants (`scopes/index.ts`, `limits/index.ts`).
- Endpoint map: `apps/dfe-core-ui/src/core/config/api/endpoints/index.ts`, typed `satisfies Record<string, Record<string, keyof paths>>`, so every entry must exist in the spec.
- Client: `apps/dfe-core-ui/src/core/config/api/client.ts`, a fetch wrapper adding auth, JSON handling and `ApiError`.
- Hooks: feature directories wrap endpoints in TanStack Query.

## The engine opens the sync PR

A push to dfe-engine's main that changes either spec runs its Sync dfe-engine-types workflow ([sync-dfe-engine-types.yml](https://github.com/hyperi-io/dfe-engine/blob/main/.github/workflows/sync-dfe-engine-types.yml) in dfe-engine). It copies both specs here, runs `generate`, and opens a `sync-dfe-engine-types-<sha>` pull request, closing any older one. The compile errors that PR raises in the endpoint map are the drift check working.

To do the same by hand against a local engine checkout:

1. Copy dfe-engine's `openapi/openapi.json` and `openapi/openapi.e2e.json` over the two files in `packages/dfe-engine-types/specs/`.
2. `yarn workspace @repo/dfe-engine-types generate`
3. Fix any compile errors in the endpoint map.

The spec's `info.version` moves with every engine release, because each release commit rewrites `openapi/openapi.json`. A version comparison detects drift between releases but not edits within one, so compare the files. The type-safety sync is documented engine-side in [type-safety-sync.md](https://github.com/hyperi-io/dfe-engine/blob/main/docs/control-plane/type-safety-sync.md).
