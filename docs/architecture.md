# dfe-ui architecture

dfe-ui is the DFE console, the Next.js app an operator signs in to, and it reads and writes through one backend, the dfe-engine API. It keeps no datastore and frames dfe-hyperdx for search, charts and dashboards.

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
  accTitle: L3 Components -- dfe-ui
  accDescr: The operator's browser requests pages through the proxy. The console pages sign in and renew through the authentication routes, call the engine through the typed API client, and frame dfe-hyperdx from the Observe page.
  browser("<b>Operator browser</b><br/><span>requests pages</span>")
  subgraph dfeui["dfe-ui"]
    direction LR
    proxy("<b>Proxy</b><br/><span>guards the signed-in pages</span>")
    pages[["<b>Console pages</b><br/><span>one feature directory per domain</span>"]]
    nextauth[["<b>Authentication</b><br/><span>NextAuth sign-in and renewal</span>"]]
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
  class browser ext
  class proxy,pages,nextauth,client,observe part
  class engine control
  class hyperdx ui
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
  style dfeui fill:none,stroke:#0072B2,stroke-width:1.5px,stroke-dasharray:6 4
```

*Figure 1. L3 Components -- dfe-ui. The browser is outside dfe-ui.* Up: top of dfe-ui. Down: [L4 Detail -- Console pages](console-and-the-flow.md), [L4 Detail -- Authentication](authentication.md), [L4 Detail -- API client](engine-api-client.md), [L4 Detail -- Observe page](observe-embed.md).

## How data flows

1. The **Proxy** takes every request for a signed-in page. It checks the session, then the forced password change, then asks the engine for the setup status. When the engine does not answer it rewrites the request to the engine-unavailable page.
2. The **Console pages** render the domain the operator opened, one feature directory per domain.
3. **Authentication** signs the operator in, renews the session and signs out, all against the engine.
4. Every engine call from feature code goes through the **API client**. Feature code makes no raw fetch.
5. The **Observe page** frames dfe-hyperdx, which authenticates the operator from the `dfe_token` cookie the proxy plants.

The calls that skip the client all run on the server: the NextAuth sign-in and session helpers, and the `getAuthPermissions` and `getSetupStatus` server actions. The NextAuth, health and metrics routes skip the proxy.

## Components

| Part           | Role                                                                                                                                  | Page                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Proxy          | `src/proxy.ts`: the auth guard, the setup redirect, the `dfe_token` cookie and the Content-Security-Policy                             | this page                                      |
| Console pages  | `src/app`: route group `(auth)` for the signed-in app, `(no-auth)` for login, first-run setup, the forced password change and outage | [console-and-the-flow.md](console-and-the-flow.md) |
| Authentication | `src/app/api/auth/[...nextauth]/route.ts` and `src/core/config/auth.ts`: sign-in, renewal and sign-out against the engine             | [authentication.md](authentication.md)         |
| API client     | `src/core/config/api`: the one typed client, with TanStack Query hooks per endpoint                                                    | [engine-api-client.md](engine-api-client.md)   |
| Observe page   | `src/app/(auth)/observe/[[...feature]]/page.tsx`: frames dfe-hyperdx in chromeless mode                                              | [observe-embed.md](observe-embed.md)           |

Paths are relative to `apps/dfe-core-ui/`.

## External dependencies

| Dependency     | Needed for                                                                 | Swappable                                                                    |
| -------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| dfe-engine API | Every read and write, sign-in and the setup status                         | No. The console exposes the engine API and never reaches past it             |
| dfe-hyperdx    | The Observe page                                                           | No                                                                           |
| An OIDC IdP    | Single sign-on, when the deployment uses it. The engine runs the handshake | Any OIDC provider the engine is configured for                               |

## Deployment variants

One artifact ships: the `ghcr.io/hyperi-io/dfe-ui` container, with a thin Helm chart built from `deploy/contract.json`. The same image runs in every profile.

- On Kubernetes, dfe-infra pins the image by tag and digest in `versions.yaml`, and Argo CD deploys the chart.
- On Docker, dfe-docker runs the same image in its compose profiles.
- In local development the app runs from a checkout with `yarn workspace dfe-core-ui dev` against a local engine on port 8003 ([local-development.md](local-development.md)).

dfe-hyperdx sits on its own subdomain. The `dfe_token` cookie is set on the shared parent domain, `DFE_COOKIE_DOMAIN`, so the frame can read it.

## Design considerations

| Aspect      | How it is handled                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security    | The proxy sets the Content-Security-Policy and guards every signed-in page. Scope gating (`RbacProtected`) hides routes and single buttons the operator's role lacks. Identity always comes from the engine |
| Reliability | A failed setup-status call goes to the engine-unavailable page, never read as setup complete                                                                                          |
| Operations  | `/livez`, `/readyz` and `/metrics` on port 3000 sit outside the proxy, so a probe without a session gets a real answer                                                              |
| Performance | A large schema import pages its rendering and validates every row ([create-schema-form.md](create-schema-form.md))                                                                    |

## Why it's built this way

| Decision                       | Reason                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| No datastore                   | The engine is the one source of truth. When the console needs data, the engine grows an endpoint                                               |
| One typed client               | The endpoint map is compile-checked against types generated from the engine's OpenAPI spec, so a route the spec drops fails the build, not the user |
| Frame dfe-hyperdx              | Search, charts and dashboards come from dfe-hyperdx in chromeless mode, so the console shell owns navigation without rebuilding them                |
| Sign-in through the engine     | For OIDC the engine is the relying party, and the console signs in with the token the engine re-mints, never the provider's |

## Diagram map

- Figure 1. L3 Components -- dfe-ui (this page)
  - [L4 Detail -- Console pages](console-and-the-flow.md)
    - [L4 Detail -- Source flow card](console-and-the-flow.md#the-source-page-draws-the-engines-flow-resolver)
    - [L4 Detail -- Uploaded row lifecycle](create-schema-form.md#how-a-row-moves-from-import-to-submit)
  - [L4 Detail -- Authentication](authentication.md)
  - [L4 Detail -- API client](engine-api-client.md)
  - [L4 Detail -- Observe page](observe-embed.md)
- [L4 Detail -- Workspace packages](../CONTRIBUTING.md#where-things-live)
- [L4 Detail -- Build and deploy](build-and-deploy.md)
- [L4 Detail -- Local console and engine](local-development.md)

## What's next

- [Build and deploy](build-and-deploy.md): the image, the chart and the release
- [Local development](local-development.md): running the console against a local engine
- [CONTRIBUTING.md Context](../CONTRIBUTING.md#context): where things live, the workspace packages, and the commands that test a change
