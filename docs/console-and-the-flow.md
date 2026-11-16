# How the console maps to the flow

A record enters DFE, is optionally transformed, and lands in a table. The console's menu groups follow that flow: Data flow defines what comes in, Detect what to look for in it, Observe is where the landed data is read, and Stack is what is running.

Data flow feeds both Observe and Detect, and Stack runs the apps behind it.

```mermaid
flowchart LR
    accTitle: L4 Detail -- Console menu groups
    accDescr: Stack runs the apps behind what Data flow defines. Data flow feeds what Observe reads and what Detect looks for.

    stack["Stack<br/>what is running"]
    dataflow["Data flow<br/>what comes in"]
    observe["Observe<br/>read the data"]
    detect["Detect<br/>what to look for"]

    stack -.-> dataflow
    dataflow --> observe
    dataflow --> detect

    classDef default fill:#F8FAFC,stroke:#64748B,stroke-width:1px,color:#0F172A
```

*Figure 1. L4 Detail -- Console menu groups. The dotted arrow is Stack running and tuning the apps, not data moving.* Up: [L3 Components -- dfe-ui](architecture.md#the-console-is-five-parts).

Each group is one RBAC family: a heading appears when at least one destination under it is the signed-in user's. The sidebar lists Observe first, then Data flow, Detect and Stack (`apps/dfe-core-ui/src/core/components/SidebarMenu/SidebarMenu/constants.tsx`).

| Group     | Destinations                                                     | Route                                                                                                        | What the user does there                         | RBAC family                                                                         |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Observe   | Search, Saved Searches, Chart Explorer, Dashboards, Hunt Results | `/observe/search`, `/observe/search/list`, `/observe/chart`, `/observe/dashboards`, `/observe/hunt-results` | look at the data                                 | `dashboard_read`                                                                    |
| Data flow | Sources, Meta Schemas, Library                                   | `/sources`, `/schemas`, `/library`                                                                           | define what comes in, its fields, where it lands | `source_*`, `schema_*`, `library_*`                                                 |
| Detect    | Rules, Hunts                                                     | `/rules`, `/hunts`                                                                                           | define what to look for                          | `rule_*`, `hunt_*`                                                                  |
| Stack     | Components, Admin Tools                                          | `/components`, `/admin-tools`                                                                                | see and tune what is running                     | `deployment_read`, `helmvars_read`, `helmvars_write`, `deployment_admin_links_read` |

The Observe destinations are dfe-hyperdx embeds and appear once a dfe-hyperdx URL is configured.

Settings and Platform are not in the menu. The settings button in the header opens them, at `/settings/admin` and `/settings/platform`. Some routes have no menu entry either: `/sources/ingest-rules`, `/schemas/meta-schemas`, `/schemas/other-schemas`, `/field-maps`, `/transforms`, `/account`, and the first-run `/setup/[step]`.

## The Source page draws the engine's flow resolver

A source's page opens on its Flow tab: three stages and the two arrows between them. The `main` source, and a source with no meta schema or not yet deployed, shows no Transform stage.

The Flow tab draws a source's input, transform and output, with the carrier and target on each arrow.

```mermaid
flowchart LR
    accTitle: L4 Detail -- Source flow card
    accDescr: The Flow tab draws an Input, a Transform and an Output stage. Each arrow between two stages names the carrier and the topic or endpoint the records move on.

    input["Input"]
    transform["Transform"]
    output["Output"]

    input -->|carrier, target| transform
    transform -->|carrier, target| output

    classDef default fill:#F8FAFC,stroke:#64748B,stroke-width:1px,color:#0F172A
```

*Figure 2. L4 Detail -- Source flow card.* Up: [L3 Components -- dfe-ui](architecture.md#the-console-is-five-parts).

| Stage     | Shows                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input     | The receiver match, the fetcher instance, or the topic your pipeline writes, with the origin and the transport.                                      |
| Transform | The app, its variant and its endpoint or topics. For your pipeline, the topics it reads and writes, its consumer group and its lag in records.       |
| Output    | The table, the topic or endpoint the loader reads it from, and whether the archive keeps the raw record.                                             |

The stages, transport and targets on that card come from `GET /api/v1/sources/{name}/flow`, which returns the engine's flow resolver, and the lag of your pipeline from `GET /api/v1/sources/{name}/lag`. The compilers write each app's deployed config from the same resolver, so the drawing and the running stack are one answer. The console never builds a topic name or an endpoint itself (`apps/dfe-core-ui/src/Sources/components/ViewSourceTabs/SourceFlowTabContent/flowStages.ts`). Three things follow:

- The card shows the effective transport, never the declared one. A source that names no transport takes the deployment's default, and the card says which.
- A refusal is the engine's sentence. When a source's stages cannot run as declared (archiving where the archiver does not have the transport, a transform app that does not have it, a transport the deployment does not offer) the resolver answers 422 and the card shows that message verbatim.
- Engine-managed stages are read-only. A fetcher instance and a transform instance are derived from the source, so the card marks them engine-owned and links to the app's page under `/components` rather than offering an edit that would be recompiled away.

With no source in the URL, the Sources page opens the `main` source, where every record the receiver cannot place lands. So the card draws that default flow before anyone has defined a source.

Transport and archive are set on the source form's first tab, beside the name:

- Transport: leave it empty to inherit the deployment default, or pick one the deployment offers, `bus` or `direct`. The engine rejects at save a flow its resolver cannot run.
- Archive: keep the raw record as it arrived. The archiver reads the landing topic, so this needs the bus.

## The Stack pages read the app manifest

The Stack destinations render from `GET /api/v1/apps`, and its entries come from the app manifest. These fields, not the app's name, decide what the console draws:

- `multiplicity` decides where an app appears. A `single` app serves every source and belongs to the fleet. A `per_config` app belongs to its source and appears on that source's page.
- `file_sets` decides whether an app instance gets a Files panel at all.
- `has_compiled_routing` decides whether a source page shows the app's routing card. That card is read-only, because the routing is compiled from the sources, and offers Sync routing when the deployed routing has drifted from them.
