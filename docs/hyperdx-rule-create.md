# Creating a Rule from a Search

## Overview

DFE UI integrates with dfe-hyperdx so users can create rules directly from search results. When a user runs a search and clicks the **Create Rule** trigger, dfe-hyperdx creates the rule in the engine and opens it in the console.

## Flow

1. **dfe-hyperdx** - The user clicks the "Create Rule" trigger. dfe-hyperdx renders the current search to SQL (`POST dfe/export-sql`).
2. **Engine** - dfe-hyperdx creates the rule through its own `dfe/create-rule` route, which forwards to the engine's `POST /api/v1/rules/from-hyperdx`.
3. **DFE UI** - dfe-hyperdx opens `/rules/{id}`, the rule's own page, in a new tab. The console keeps no copy of the search.
