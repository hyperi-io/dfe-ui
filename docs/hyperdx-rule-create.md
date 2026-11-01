# Creating a Rule from a HyperDX Search

## Overview

DFE UI integrates with HyperDX so users can create rules directly from search results. When a user runs a search and clicks the **Create Rule** trigger, HyperDX creates the rule in the engine and opens it in the console.

## Flow

1. **HyperDX** - The user clicks the "Create Rule" trigger. HyperDX calls the `/exportSql` endpoint to fetch the raw SQL for the current search.
2. **Engine** - HyperDX posts the search to the engine's `dfe/create-rule` route, which stores the rule.
3. **DFE UI** - HyperDX opens `/rules/{id}`, the rule's own page. The console keeps no copy of the search.
