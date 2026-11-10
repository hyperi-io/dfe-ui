# Creating a Rule from a Search

## Overview

DFE UI integrates with dfe-hyperdx so users can create rules directly from search results. When a user runs a search and clicks the **Create Rule** trigger, dfe-hyperdx creates the rule in the engine and opens it in the console.

## Flow

1. **dfe-hyperdx** - The user clicks the "Create Rule" trigger. dfe-hyperdx calls the `/exportSql` endpoint to fetch the raw SQL for the current search.
2. **Engine** - dfe-hyperdx posts the search to the engine's `dfe/create-rule` route, which stores the rule.
3. **DFE UI** - dfe-hyperdx opens `/rules/{id}`, the rule's own page. The console keeps no copy of the search.
