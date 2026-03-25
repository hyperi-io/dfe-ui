import { SourceDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { describe, expect, test } from 'vitest';
import { transformSourceRequestBodyToFormData } from './transformSourceRequestBodyToFormData';

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
    const result = transformSourceRequestBodyToFormData(source);
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

  test('when fetcher is an empty object, should return fetcher: null', () => {
    const source: SourceDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      // @ts-expect-error - test case
      fetcher: {},
    };
    const result = transformSourceRequestBodyToFormData(source);
    expect(result).toEqual({
      source: 'source',
      display_name: 'display name',
      enabled: false,
      fetcher: null,
    });
  });

  test('when fetcher is null, should return fetcher: null', () => {
    const source: SourceDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      fetcher: null,
    };
    const result = transformSourceRequestBodyToFormData(source);
    expect(result).toEqual({
      source: 'source',
      display_name: 'display name',
      enabled: false,
      fetcher: null,
    });
  });
});
