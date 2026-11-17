# dfe-ui architecture

dfe-ui is the operator console of the DFE suite: a Next.js app that talks to one backend, the dfe-engine API, and frames dfe-hyperdx for data exploration. It has no datastore: what it shows and changes goes through engine endpoints, Observe content comes from dfe-hyperdx, and the browser keeps preferences such as the theme in local storage. The console exposes the well-trodden part of the engine API and never reaches past it. When the console needs data, the engine grows an endpoint.

## The console is five parts

The browser reaches the console through the proxy, and the console reaches the engine through the NextAuth routes and the typed API client.

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
    .ingest .label-icon{color:#0E8A7D}
    .xform .label-icon{color:#7B4FB0}
    .load .label-icon{color:#0072B2}
    .bus .label-icon{color:#A8517F}
    .store .label-icon{color:#00785A}
    .ui .label-icon{color:#D9480F}
    .ext .label-icon{color:#64748B}
---
flowchart LR
  accTitle: L3 Components -- dfe-ui
  accDescr: The operator's browser requests pages through the proxy. The console pages sign in and renew through the NextAuth routes, call the engine through the typed API client, and frame dfe-hyperdx from the Observe page.
  browser("<b>Operator browser</b><br/><span>requests pages</span>")
  subgraph dfeui["dfe-ui"]
    proxy("<b>Proxy</b><br/><span>guards the signed-in pages</span>")
    pages[["<b>Console pages</b><br/><span>one feature directory per domain</span>"]]
    nextauth[["<b>NextAuth routes</b><br/><span>sign-in and renewal</span>"]]
    client[["<b>API client</b><br/><span>typed calls to the engine</span>"]]
    observe[["<b>Observe page</b><br/><span>frames the embedded view</span>"]]
  end
  engine("<b>dfe-engine API</b><br/><span>the control plane</span>")
  hyperdx("<b>dfe-hyperdx</b><br/><span>search, charts, dashboards</span>")
  browser -->|requests| proxy
  proxy --> pages
  pages --> nextauth
  pages --> client
  pages --> observe
  nextauth -->|sign-in| engine
  client -->|API calls| engine
  observe -->|frame| hyperdx
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
  class browser ext
  class proxy,pages,nextauth,client,observe part
  class engine control
  class hyperdx ui
  style dfeui fill:none,stroke:#0072B2,stroke-width:1.5px,stroke-dasharray:6 4
```

*Figure 1. L3 Components -- dfe-ui. The grey dashed box is external.* Up: top of dfe-ui. Down: [L4 Detail -- Console menu groups](console-and-the-flow.md), [L4 Detail -- Source flow card](console-and-the-flow.md#the-source-page-draws-the-engines-flow-resolver), [L4 Detail -- OIDC sign-in](authentication.md#sign-in-goes-through-the-engine), [L4 Detail -- Engine API client](engine-api-client.md#the-spec-becomes-typed-calls), [L4 Detail -- Observe embed](observe-embed.md), [L4 Detail -- Uploaded row lifecycle](create-schema-form.md#how-a-row-moves-from-import-to-submit).

| Part            | Code                                                                                    | Does                                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proxy           | `apps/dfe-core-ui/src/proxy.ts`                                                         | Guards the signed-in pages, sends an account on an issued password to the password change and an incomplete setup to the wizard, plants the `dfe_token` cookie and sets the Content-Security-Policy. |
| Console pages   | `apps/dfe-core-ui/src/app`, one feature directory per domain                            | Route group `(auth)` for the signed-in app, and `(no-auth)` for login, first-run setup, the forced password change and the engine-unavailable page.                                                   |
| NextAuth routes | `apps/dfe-core-ui/src/app/api/auth/[...nextauth]/route.ts`, `apps/dfe-core-ui/src/core/config/auth.ts` | Sign-in, session renewal and sign-out against the engine ([authentication.md](authentication.md)).                                                                                       |
| API client      | `apps/dfe-core-ui/src/core/config/api`                                                  | The one typed client feature code calls the engine through, with TanStack Query hooks per endpoint ([engine-api-client.md](engine-api-client.md)).                                                     |
| Observe page    | `apps/dfe-core-ui/src/app/(auth)/observe/[[...feature]]/page.tsx`                       | Frames dfe-hyperdx in chromeless mode ([observe-embed.md](observe-embed.md)).                                                                                                                         |

On a signed-in page the proxy checks the session, then the forced password change, then asks the engine for the setup status, and rewrites the request to the engine-unavailable page when the engine does not answer. The NextAuth, health and metrics routes skip the proxy. Feature code makes no raw fetch. The calls that skip the client all run on the server: the NextAuth sign-in and session helpers, and the `getAuthPermissions` and `getSetupStatus` server actions.

## One app ships, built from six packages

Five workspace packages are bundled into the one app that ships.

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
    .ingest .label-icon{color:#0E8A7D}
    .xform .label-icon{color:#7B4FB0}
    .load .label-icon{color:#0072B2}
    .bus .label-icon{color:#A8517F}
    .store .label-icon{color:#00785A}
    .ui .label-icon{color:#D9480F}
    .ext .label-icon{color:#64748B}
---
flowchart LR
  accTitle: L4 Detail -- Workspace packages
  accDescr: Two generated packages and three hand-written packages are bundled into the dfe-core-ui app. The JSON viewer builds on the shared UI package.
  subgraph generated["Generated"]
    direction LR
    types("<b>dfe-engine-types</b><br/><span>from the OpenAPI spec</span>")
    icons("<b>dfe-icons</b><br/><span>generated from SVG source</span>")
  end
  subgraph written["Hand-written"]
    direction LR
    logger("<b>dev-logger</b><br/><span>logging</span>")
    shared("<b>dfe-shared-ui</b><br/><span>shared UI components</span>")
    json("<b>dfe-json-viewer-cn</b><br/><span>the JSON viewer</span>")
    shared --> json
  end
  core("<b>dfe-core-ui</b><br/><span>the app that ships</span>")
  generated -->|bundled| core
  written -->|bundled| core
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
  class types,icons,logger,shared,json part
  class core ui
```

*Figure 2. L4 Detail -- Workspace packages. dfe-core-ui is the app that ships.* Up: [dfe-ui documentation](README.md).

`dfe-engine-types` is generated from the engine's OpenAPI spec and `dfe-icons` from SVG source. The sixth package, `typescript-config`, is the tsconfig the four React and logging packages extend, and nothing of it reaches the bundle. `dfe-core-ui` alone ships, as Next standalone output in a three-stage Dockerfile ([build-and-deploy.md](build-and-deploy.md)). No package is published by itself.
