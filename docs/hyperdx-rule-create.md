# Creating a Rule from a Search

A search in the console's Observe pages can become a detection rule. dfe-hyperdx creates the rule in the engine and opens it in the console, which keeps no copy of the search and holds no listener for the hand-off.

## Flow

1. In dfe-hyperdx, the user clicks the Create Rule trigger, and dfe-hyperdx renders the current search to SQL (`POST /dfe/export-sql`).
2. dfe-hyperdx creates the rule through its `POST /dfe/create-rule` route, which forwards to the engine's `POST /api/v1/rules/from-hyperdx` with the caller's engine token.
3. dfe-hyperdx opens `/rules/{id}`, the rule's page in the console, in another tab.

The routes are in dfe-hyperdx's `packages/api/src/dfe/routers/query-export.ts`, and the trigger in `packages/app/src/dfe/components/CreateRuleFromSearch/index.tsx`.
