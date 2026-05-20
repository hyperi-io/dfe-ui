# `CreateSchemaForm` (dfe-core-ui)

Documentation for `apps/dfe-core-ui/src/Schemas/components/CreateSchemaForm` and how it behaves with large uploads.

## Purpose

Users can create a schema from metadata fields plus columns. Columns can come from a **manual table** or from **CSV / Elastic index template** conversion. Imports can be large, so the UI limits how much of the editable grid is rendered at once while still keeping the full dataset in application state for save and validation.

## Component map

| Piece | Role |
|--------|------|
| `CreateSchemaForm` | Ant Design `Form` with `preserve`, wires `onFinish`, clears a top-level error banner on change. |
| `CreateSchemaFormProvider` (`CreateSchemaForm.context.tsx`) | Holds `uploadedSchemaColumns`, `invalidUploadedSchemaColumns`, `schemaColumns`, sync helpers, and merges form ↔ invalid-row state. |
| `SchemaUploadCollapse` | Upload type (CSV vs JSON), file dragger, tabs for uploaded vs additional columns once a file produced rows. |
| `SchemaUploadFileSection` | Calls `convertCsv` (CSV) or `useElasticConvert` (JSON); pushes rows into context via `handleSetUploadedSchemaColumns`. |
| `UploadedSchemaTable` | “Valid” uploaded columns: `AddSchemaTable` over `uploadedColumns` **with pagination** (default page size 50). |
| `InvalidColumnsCollapse` | Rows that failed `rowSchema` on import: separate `Form.List` `invalidColumns`, **no pagination**, effect-driven promotion back to valid. |
| `AddSchemaTable` | `Form.List` + table; syncs list from `initialValues` when a `JSON.stringify` signature of those values changes. |

## Implementation flow

1. **Import** — File is converted; rows are normalized (e.g. `listItemFromPartial`) and passed to `handleSetUploadedSchemaColumns`. That function runs `rowSchema.safeParse` per row: valid rows become `uploadedSchemaColumns`, failures become `invalidUploadedSchemaColumns` (with Zod error metadata).

2. **Form lists** — `AddSchemaTable` uses `useLayoutEffect` to `setFieldsValue` for its `Form.List` name when `initialValues` content changes (dependency is a serialized signature, not reference equality).

3. **Invalid → valid promotion (two paths)**  
   - **`InvalidColumnsCollapse`**: `Form.useWatch('invalidColumns')` + `useEffect` re-parses rows; when a row becomes valid, `handleUpdateInvalidUploadedSchemaColumn` moves it into `uploadedSchemaColumns`, updates `invalidColumns` / `uploadedColumns` in the form, then `queueMicrotask` → `validateFields` on the promoted row paths.  
   - **`handleUpdateUploadedSchemaColumns`** (called from `onValuesChange` on the main form): if `uploadedColumns` changed and there are still invalid rows, merges live form rows with invalid payloads **by stable row `id`** and promotes when `rowSchema.safeParse` succeeds.

4. **Submit** — `onFinish` does **not** rely on Ant Design alone: it runs `rowSchema.safeParse` over **every** `uploadedSchemaColumns` and `schemaColumns` entry from context and blocks submit if `invalidUploadedSchemaColumns` is non-empty or any parse fails.

## Pagination vs “viewport”

The uploaded-columns table passes Ant Design **`pagination`** into `Table`. The table only **renders** the current page of rows, so nested `Form.Item`s for off-page rows are typically **not mounted** on that page.

Implications:

- **Mounted fields** are mostly the current page (plus invalid rows, which use a separate list and are **not** paginated).
- The parent form uses **`preserve`**, which helps avoid losing list values when list field components unmount as the user changes pages; do not assume this removes all edge cases around list registration and validation ordering.
- **Authoritative full-list state for submit** is the context arrays + explicit `safeParse` in `onFinish`, not “whatever the visible cells show.”

## Performance implications

### Full-form Zod validation per field rule

`useAntdZodResolver` implements each `Form.Item` rule by calling `schema.safeParseAsync(getFieldsValue())` — i.e. it parses the **entire** form shape for **every** validated control path that uses `formValidation`.

With large `uploadedColumns` / `schemaColumns` lists, **each** triggered validation can mean a **full** parse of the combined schema. Many cells × many validations scales poorly even when the table paginates visible rows.

### Other costs

- **`JSON.stringify(initialValues)`** in `AddSchemaTable` runs each render to build a dependency signature; for very large arrays this is extra CPU and allocation on every render where the parent passes a new array reference.
- **Duplicate row validation**: import-time `safeParse`, submit-time `safeParse` again over full context arrays.
- **`SchemaUploadCollapse` tabs** use `forceRender: true`, so uploaded and additional-column subtrees stay mounted together once tabs appear — more simultaneous components than lazy mounting would imply.
- **`InvalidColumnsCollapse`** disables pagination; a large invalid set renders **all** invalid rows at once (heavy DOM + many registered fields).

### Upload / conversion path

CSV conversion (`convertCsv`) and Elastic conversion (`useElasticConvert`) run outside the table pagination story: timeouts or payload limits hit **network/server or mutation** layers before the paginated UI helps.

## Caveats and behavioral quirks

1. **Two sources of truth** — Display/editing flows through Ant Design `Form.List`; canonical arrays for promotion and submit live in React context (`uploadedSchemaColumns`, etc.). Helpers keep them aligned when promoting or removing rows; divergence is possible if a future change writes only one side.

2. **Invalid-row editing relies on effects** — Fixing invalid rows is partly driven by `useWatch` + `useEffect` (`InvalidColumnsCollapse`) and partly by `onValuesChange` merges (`handleUpdateUploadedSchemaColumns`). Order and timing matter for promotion and `validateFields`.

3. **`changedValuesMayAffectUploadedColumns`** — `onValuesChange` short-circuits unless the change might touch nested `uploadedColumns`; merges for invalid rows only run when that predicate passes.

4. **Stable row ids** — Promotion and removal match rows by **`id`**. Hidden `Form.Item` for `id` exists so list merges and promotions stay stable; missing or unstable ids break promotion/removal logic.

5. **`schemaColumns` manual table** — When no upload exists, schema columns use `AddSchemaTable` **without** pagination in `SchemaUploadCollapse`; large manual schemas face the same validation and stringify costs without row paging.

## Practical workarounds

**For users / operators**

- Prefer **cleaning CSV/JSON upstream** so fewer rows land in **Invalid Columns** (that panel is unpaginated).
- For enormous files, consider **splitting** artifacts or correcting imports outside the UI if conversion or submit payloads hit limits.

**For maintainers**

- Treat context arrays + submit-time `rowSchema` checks as the **contract** for correctness; use pagination as a **rendering** mitigation, not proof that validation cost is bounded.
- Before adding more `Form.Item`s with `formValidation`, remember each validation can re-parse the **whole** form — scoped rules or lighter validators on hot paths reduce quadratic-style blowups.
- If `InvalidColumnsCollapse` grows unwieldy for huge error sets, **pagination or virtualization** there would align it with the uploaded table’s strategy (would require careful promotion/remove semantics).

## Related files

- `CreateSchemaForm/index.tsx` — form shell, schemas (`formSchema` / `formSchemaRequest`), submit guards.
- `CreateSchemaForm.context.tsx` — state, refs for synchronous updates, promotion/remove, microtask validation.
- `UploadedSchemaTable/index.tsx` — pagination defaults for uploaded rows.
- `InvalidColumnsCollapse/index.tsx` — invalid list, watch/effect promotion.
- `AddSchemaTable/index.tsx` — `Form.List`, table, `initialValues` sync.
- `SchemaUploadFileSection.tsx` — file handling and conversion entry points.
