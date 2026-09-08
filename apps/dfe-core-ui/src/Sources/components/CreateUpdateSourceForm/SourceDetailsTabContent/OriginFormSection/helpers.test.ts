import { TAppsResponse } from '@/core/hooks/apps/instances/useFetchApps/types';
import { describe, expect, test } from 'vitest';
import { getFetcherSourceTypes } from './helpers';

const app = (
  overrides: Partial<TAppsResponse[number]>,
): TAppsResponse[number] =>
  ({
    service: 'dfe-transform-vrl',
    scale_deployed: true,
    multiplicity: 'per_config',
    has_compiled_routing: false,
    routing_scope: 'stack',
    file_sets: [],
    instances: [],
    ...overrides,
  }) as TAppsResponse[number];

describe('getFetcherSourceTypes', () => {
  test('reads the families off whichever app declares them', () => {
    const apps: TAppsResponse = [
      app({ service: 'dfe-receiver' }),
      app({
        service: 'dfe-fetcher',
        routing_scope: 'instance',
        source_types: ['okta', 'aws', 'crates_io'],
      }),
    ];

    expect(getFetcherSourceTypes(apps)).toEqual(['aws', 'crates_io', 'okta']);
  });

  test('is empty when no deployed app declares any', () => {
    expect(getFetcherSourceTypes([app({})])).toEqual([]);
    expect(getFetcherSourceTypes(undefined)).toEqual([]);
  });

  test('a family declared by two apps is listed once', () => {
    const apps: TAppsResponse = [
      app({ service: 'dfe-fetcher', source_types: ['okta'] }),
      app({ service: 'dfe-fetcher-edge', source_types: ['okta', 'aws'] }),
    ];

    expect(getFetcherSourceTypes(apps)).toEqual(['aws', 'okta']);
  });
});
