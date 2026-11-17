# Build and deploy

One shipped artifact: the `dfe-core-ui` Next.js app as a standalone-output container, published by hyperi-ci to `ghcr.io/hyperi-io/dfe-ui` with a thin Helm chart built from its deployment contract. The workspace packages are bundled into the app at build, and none is published to npm (`release.destinations.npm: false` in `.hyperi-ci.yaml`).

A release reaches a running pod as one image and one chart.

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
flowchart TB
  accTitle: L4 Detail -- Build and deploy
  accDescr: hyperi-ci builds the dfe-ui repo into a container image and a thin chart. dfe-infra deploys the chart with its values and the image tag and digest it pins, and the result is the dfe-ui pod.
  subgraph build["Build"]
    direction LR
    repo("<b>dfe-ui repo</b><br/><span>the source</span>")
    ci("<b>hyperi-ci release</b><br/><span>builds and publishes</span>")
    repo --> ci
  end
  subgraph pub["Published"]
    direction LR
    image[("<b>Container image</b><br/><span>ghcr.io/hyperi-io/dfe-ui</span>")]
    chart[("<b>Thin chart</b><br/><span>from the deployment contract</span>")]
    image ~~~ chart
  end
  subgraph deploy["Deploy"]
    direction LR
    infra("<b>dfe-infra deploy</b><br/><span>pins the tag and digest</span>")
    pod("<b>dfe-ui pod</b><br/><span>the running console</span>")
    infra --> pod
  end
  build -->|push, publish| pub
  pub -->|tag, digest, chart| deploy
  class repo,image,chart store
  class ci ext
  class infra control
  class pod ui
  class repo,image,chart store
  class ci ext
  class infra control
  class pod ui
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
  style build fill:none,stroke:#0072B2,stroke-width:1.5px,stroke-dasharray:6 4
  style pub fill:none,stroke:#0072B2,stroke-width:1.5px,stroke-dasharray:6 4
  style deploy fill:none,stroke:#0072B2,stroke-width:1.5px,stroke-dasharray:6 4
```

*Figure 1. L4 Detail -- Build and deploy. The container image is the one artifact this repo ships.* Up: [dfe-ui documentation](README.md).

- Build: `yarn build` (turbo). The app uses Next standalone output with `outputFileTracingRoot` at the monorepo root, so the container has only what the app needs.
- Container: a three-stage `Dockerfile`. The builder installs and runs `yarn build`, `app_tree` assembles the standalone output with `.next/static` and `public/` beside it, and `runner` is the slim runtime that runs as uid 1001. `NEXT_PUBLIC_*` variables are inlined at BUILD time, and the image bakes `NEXT_PUBLIC_API_URL` as empty, so the browser calls the engine on the console's origin. Everything else the app reads at runtime comes from ordinary env vars ([observe-embed.md](observe-embed.md) has the embed case).
- Publish: in CI, hyperi-ci pushes the image to `ghcr.io/hyperi-io/dfe-ui` and the thin chart to its OCI chart registry. `make build` wraps `hyperi-ci run build`. semantic-release derives the version from the commits, so the version is never bumped by hand.
- Deploy: dfe-infra deploys the thin chart with its integration values for the app (`argocd/values/apps/dfe-ui/values.yaml` in dfe-infra) and then the deploy repo's instance values file, which the engine writes. dfe-infra's `versions.yaml` pins the image tag and digest.
- Deployment contract: `deploy/contract.json` (scalo-service contract schema v4) declares the port, probes, run-as identity, NextAuth secret and scaling the chart renders the pod from. Keep `security` in step with the Dockerfile `USER` and `health` with the route handlers.
- Headers: every page leaves `apps/dfe-core-ui/src/proxy.ts` with a Content-Security-Policy with a fresh script nonce, which is why no page is prerendered. `apps/dfe-core-ui/next.config.ts` adds `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: DENY` to every response and drops `X-Powered-By`. A proxy in front must pass these through rather than replace them.
