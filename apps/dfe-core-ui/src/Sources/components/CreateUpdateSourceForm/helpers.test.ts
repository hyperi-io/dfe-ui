import { describe, expect, test } from 'vitest';
import { transformSourceInitialValues } from './helpers';

describe('transformSourceInitialValues', () => {
  test('when fetcher.auth is null, should return fetcher.auth.type: none', () => {
    const source = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        auth: null,
        poll_interval_secs: 300,
      },
    };
    const result = transformSourceInitialValues(source);
    expect(result).toEqual({
      source: 'source',
      display_name: 'display name',
      enabled: false,
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        auth: {
          type: 'none',
        },
        poll_interval_secs: 300,
      },
    });
  });
});
