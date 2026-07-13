# Creating a Rule from a HyperDx Search

## Overview

DFE UI integrates with HyperDx so users can create rules directly from search results. HyperDx queries data with Lucene/SQL. When a user runs a search and clicks the **Create Rule** trigger, HyperDx fetches the raw SQL for that search and sends it to DFE UI.

## Flow

1. **HyperDx** – The user clicks the "Create Rule" trigger. HyperDx calls the `/exportSql` endpoint to fetch the raw SQL for the current search.
2. **Messaging** – HyperDx posts the search data to a browser message listener on the `/rules/create` page. HyperDx retries until DFE UI responds.
3. **DFE UI** – On receipt, DFE UI stores the search in IndexedDB and adds its ID to the URL query string. The data remains available until the user clears their cache.
