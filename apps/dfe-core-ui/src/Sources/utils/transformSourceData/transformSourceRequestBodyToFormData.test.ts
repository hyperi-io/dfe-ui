import { SourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { describe, expect, test } from 'vitest';
import { transformSourceRequestBodyToFormData } from './transformSourceRequestBodyToFormData';

describe('transformSourceRequestBodyToFormData', () => {
  test('when fetcher.auth is null, should return fetcher.auth.type: none', () => {
    const source: SourceVersionDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      version: {
        date_time: 'string',
        fetcher: {
          source_type: 'source_type',
          base_url: 'base_url',
          auth: null,
          poll_interval_secs: 300,
        },
        match: {
          field: 'field',
          value: 'value',
          operator: 'equals',
        },
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.fetcher).toEqual({
      source_type: 'source_type',
      base_url: 'base_url',
      auth: {
        type: 'none',
      },
      poll_interval_secs: 300,
    });
    expect(result.source).toBe('source');
    expect(result.display_name).toBe('display name');
    expect(result.enabled).toBe(false);
    expect(result.match).toEqual({
      field: 'field',
      value: 'value',
      operator: 'equals',
    });
  });

  test('when fetcher is an empty object, should return fetcher: null', () => {
    const source: SourceVersionDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      version: {
        // @ts-expect-error - test case
        fetcher: {},
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.fetcher).toBeNull();
    expect(result.source).toBe('source');
    expect(result.display_name).toBe('display name');
    expect(result.enabled).toBe(false);
  });

  test('when version has no fetcher, should return fetcher: null', () => {
    const source: SourceVersionDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      version: {
        date_time: 'string',
        header: {
          type: 'string',
          version: 'string',
          // @ts-expect-error - test case
          fetcher: null,
        },
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.fetcher).toBeNull();
    expect(result.source).toBe('source');
    expect(result.display_name).toBe('display name');
    expect(result.enabled).toBe(false);
    expect(result.header).toEqual({
      type: 'string',
      version: 'string',
      fetcher: null,
    });
  });
});
