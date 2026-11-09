import { APIRequestContext, expect } from '@playwright/test';

import { ENGINE_API_URL } from '@e2e/config/e2e.client';

/** A thin engine API client for the under-the-hood assertions. */
export const engineClient = (request: APIRequestContext, token: string) => {
  const headers = { Authorization: `Bearer ${token}` };
  const url = (path: string) => `${ENGINE_API_URL}/api/v1${path}`;
  return {
    get: (path: string) => request.get(url(path), { headers }),
    post: (path: string, data?: unknown) =>
      request.post(url(path), { headers, data }),
    put: (path: string, data?: unknown) =>
      request.put(url(path), { headers, data }),
    del: (path: string) => request.delete(url(path), { headers }),
  };
};

/** Create the rule through the API and return its name. */
export const apiCreateRule = async (
  api: ReturnType<typeof engineClient>,
  name: string,
  extra: Record<string, unknown> = {},
) => {
  const res = await api.post('/rules', {
    name,
    display_name: name,
    severity: 'medium',
    user_sql: "SELECT * FROM dfe.main WHERE _source = 'jdet-src'",
    estimate_cost: false,
    ...extra,
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return name;
};

/** The shared-table source the journeys route their events and rules through. */
export const JDET_SOURCE = 'jdet-src';

/** Create the journey source when it is missing, and report whether this call made it. */
export const ensureSource = async (api: ReturnType<typeof engineClient>) => {
  if ((await api.get(`/sources/${JDET_SOURCE}`)).ok()) return false;
  const res = await api.post('/sources', {
    source: JDET_SOURCE,
    display_name: 'JDET source',
    match: { field: 'jdet_kind', operator: 'equals', value: 'jdet' },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return true;
};

export const dropSource = (api: ReturnType<typeof engineClient>) =>
  api.del(`/sources/${JDET_SOURCE}`);
