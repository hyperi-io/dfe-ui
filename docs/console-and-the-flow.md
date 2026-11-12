# How the console maps to the flow

A record enters DFE, is optionally reshaped, and lands in a table. The console
is arranged in that order, so a new operator can read the menu top to bottom and
learn how their data moves.

```mermaid
flowchart LR
    OB[Observe<br/>look at the data]
    DF[Data flow<br/>define what comes in]
    DT[Detect<br/>define what to look for]
    ST[Stack<br/>see and tune what is running]
    DF --> OB
    DF --> DT
    ST -.-> DF
```

## The four groups

Each group is one RBAC family: a heading appears exactly when at least one
destination under it is the signed-in user's.

| Group     | Destinations                                                     | Route                                                                                              | What the user does there                               | RBAC family                                    |
| --------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Observe   | Search, Saved Searches, Chart Explorer, Dashboards, Hunt Results | `/observe/search`, `/observe/search/list`, `/observe/chart`, `/observe/dashboards`, `/observe/hunt-results` | look at the data                                       | `dashboard_read`                               |
| Data flow | Sources, Meta Schemas, Library                                   | `/sources`, `/schemas`, `/library`                                                                 | define what comes in, how it is shaped, where it lands | `source_*`, `schema_*`, `library_*`            |
| Detect    | Rules, Hunts                                                     | `/rules`, `/hunts`                                                                                 | define what to look for                                | `rule_*`, `hunt_*`                             |
| Stack     | Components, Admin Tools                                          | `/components`, `/admin-tools`                                                                      | see and tune what is running                           | `deployment_read`, `helmvars_read`, `helmvars_write`, `deployment_admin_links_read` |

The Observe destinations are dfe-hyperdx embeds and appear only once a dfe-hyperdx URL
is configured.

Settings and Platform are not in the menu. The settings button in the header
opens them, at `/settings/admin` and `/settings/platform`. Some routes have no
menu entry either: `/sources/ingest-rules`, `/schemas/meta-schemas`,
`/schemas/other-schemas`, `/field-maps`, `/transforms`, `/account`, and the
first-run `/setup/[step]`.

## The Source page follows the flow

A source's own page opens on **Flow**: three stages and the two arrows between
them.

```mermaid
flowchart LR
    IN[INPUT<br/>receiver match, or the fetcher instance]
    TR[TRANSFORM<br/>app, variant, the files it reads]
    OUT[OUTPUT<br/>table, archive]
    IN -->|carrier + topic or endpoint| TR
    TR -->|carrier + topic or endpoint| OUT
```

Every value on that card comes from `GET /api/v1/sources/{name}/flow`, which
returns the engine's own flow resolver. The compilers write each app's deployed
config from the same resolver, so the drawing and the running stack are one
answer rather than two implementations of a naming convention. The console
never builds a topic name or an endpoint of its own.

Three things follow from reading the resolver rather than the source's fields:

- **The effective transport is shown, not the declared one.** A source that
  names no transport takes the deployment's default, and the card says which.
- **A refusal is the engine's own sentence.** When a source's stages cannot run
  as declared -- archiving on a deployment with no bus, a transform app that
  does not carry the chosen transport -- the resolver answers 422 and the card
  shows that message verbatim, beside the choice that caused it.
- **Engine-owned stages are read-only.** A fetcher instance and a transform
  instance are derived from the source, so the card marks them and links to
  where the deployed app is managed rather than offering an edit that would be
  recompiled away.

The same card draws the **default flow** -- where a record the receiver cannot
place lands -- on the Sources page before any source is selected. It answers
before anyone has configured anything, because that flow is already running.

## Where a source's transport and archive are set

Both live on the source form's first tab, beside the name:

- **Transport** -- leave it inherited to follow the deployment default, or name
  `bus` or `direct`. The engine refuses a transport the deployment does not
  offer, at save.
- **Archive** -- keep the raw record as it arrived. The archiver reads the
  landing topic, so this needs the bus.

## Reading an app's shape rather than naming it

The Stack destinations render from `GET /api/v1/apps`, whose entries come from
the app manifest. Nothing in the console is keyed to an app's name:

- `multiplicity` decides where an app appears -- a single deployment serves
  every source and belongs to the fleet; a per-config one belongs to its source
  and appears on that source's page.
- `file_sets` decides whether an app gets a file editor at all.
- `has_compiled_routing` decides whether its routing is derived from the sources
  (and so read-only, with drift re-synced) or hand-set.
- `profiles` says which deployment profiles may run the app, and `default_in`
  which ones run it without being asked. An app nothing deploys by default is
  reported as `optional`, and the console offers it as something to turn on
  rather than something missing.
