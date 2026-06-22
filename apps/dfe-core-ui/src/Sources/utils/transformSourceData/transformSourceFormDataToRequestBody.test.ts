import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { describe, expect, test } from 'vitest';
import { transformSourceFormDataToRequestBody } from './transformSourceFormDataToRequestBody';

describe('transformSourceFormDataToRequestBody', () => {
  test('when fetcher is an empty object, should return fetcher: null', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      display_name: 'display name',
      // @ts-expect-error - test case
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
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      display_name: 'display name',
      enabled: true,
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        poll_interval_secs: 300,
        auth: {
          type: 'none',
        },
      },
      match: { field: 'field', value: 'value' },
    };

    const result = transformSourceFormDataToRequestBody(source);
    expect(result).toEqual({
      source: 'source',
      display_name: 'display name',
      enabled: true,
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        poll_interval_secs: 300,
        auth: null,
      },
      match: { field: 'field', value: 'value' },
    });
  });
});
