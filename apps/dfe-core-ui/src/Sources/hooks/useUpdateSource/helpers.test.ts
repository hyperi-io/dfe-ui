import { describe, expect, test } from 'vitest';
import { transformSourceFormDataToRequestBody } from './helpers';

describe('transformSourceFormDataToRequestBody', () => {
  test('when fetcher is an empty object, should return fetcher: null', () => {
    const source = {
      source: 'source',
      display_name: 'display name',
      fetcher: {},
    };
    const result = transformSourceFormDataToRequestBody(source);
    expect(result).toEqual({
      source: 'source',
      display_name: 'display name',
      fetcher: null,
    });
  });

  test('when fetcher auth type is none, should return fetcher.auth: null', () => {
    const source = {
      source: 'source',
      display_name: 'display name',
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        auth: {
          type: 'none',
        },
      },
    };
    const result = transformSourceFormDataToRequestBody(source);
    expect(result).toEqual({
      source: 'source',
      display_name: 'display name',
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        auth: null,
      },
    });
  });
});
