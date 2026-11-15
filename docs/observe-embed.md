# The /observe embed - the Observe explore surface

`/observe/[[...feature]]` (`apps/dfe-core-ui/src/app/(auth)/observe/[[...feature]]/page.tsx`) frames dfe-hyperdx in chromeless mode (`?embed=1`), so the dfe-ui shell owns navigation while dfe-hyperdx provides search, charts and dashboards over the data in ClickHouse. The page maps its path to the dfe-hyperdx route (`/observe` to `/search`, `/observe/dashboards` to `/dashboards/list`, `/observe/hunt-results` to `/search?source=hunts`). The initial theme rides the URL, and the page posts it again as a `DFE_SET_THEME` message when the frame loads and on every theme toggle.

```mermaid
flowchart LR
    SHELL[dfe-ui shell<br/>owns nav + theme] -->|iframe ?embed=1| HDX[dfe-hyperdx<br/>chromeless]
    SHELL -->|postMessage DFE_SET_THEME| HDX
```

## How it is configured

One runtime mechanism, two ways to reach dfe-hyperdx. The `(auth)` layout reads both values per request and hands them to `HyperdxContext`. `useHyperdxUrl()` is the one source the frame URL and the sidebar gating read.

| Variable       | Points at                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `HYPERDX_URL`  | dfe-hyperdx on its own hostname (k8s gateway: `https://hyperdx.{domain}`). Wins when set.                                        |
| `HYPERDX_PORT` | Same host, different port (docker compose). Host comes from `window.location`, so it is correct for localhost and LAN alike. |

Neither is `NEXT_PUBLIC_`, and that is deliberate: a build-inlined read would
bake the build machine's value into the browser bundle. With neither set,
`/observe` renders "Search is not configured for this deployment."

The console's Content-Security-Policy frames nothing but dfe-hyperdx: `frame-src` is `HYPERDX_URL`'s origin, or the host the browser used on `HYPERDX_PORT`. dfe-hyperdx reached any other way is blocked in the browser.

## Rule-create round trip

dfe-hyperdx creates the rule through its `/dfe/create-rule` route, which forwards to the engine, and opens `/rules/{id}` in a new tab. dfe-ui holds no listener for it. Detail: [hyperdx-rule-create.md](hyperdx-rule-create.md).
