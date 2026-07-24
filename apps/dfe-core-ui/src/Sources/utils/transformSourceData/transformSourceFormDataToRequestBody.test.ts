import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TSourceUpdateRequestBody } from '@/Sources/hooks/useUpdateSource/types';
import { describe, expect, test } from 'vitest';
import { transformSourceFormDataToRequestBody } from './transformSourceFormDataToRequestBody';

describe('transformSourceFormDataToRequestBody', () => {
  test('when fetcher is an empty object, should return fetcher: null', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      display_name: 'display name',
      // @ts-expect-error - test case
      fetcher: {},
      enabled: true,
    };

    const result = transformSourceFormDataToRequestBody(source);

    const expectedResult: TSourceUpdateRequestBody = {
      source: 'source',
      display_name: 'display name',
      enabled: true,
      fetcher: null,
      match: { field: '', operator: 'equals', value: '' },
    };
    expect(result).toEqual(expectedResult);
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
      match: { field: 'field', value: 'value', operator: 'equals' },
    };

    const result = transformSourceFormDataToRequestBody(source);
    const expectedResult: TSourceUpdateRequestBody = {
      source: 'source',
      display_name: 'display name',
      enabled: true,
      fetcher: {
        source_type: 'source_type',
        base_url: 'base_url',
        poll_interval_secs: 300,
        auth: null,
      },
      match: { field: 'field', operator: 'equals', value: 'value' },
    };
    expect(result).toEqual(expectedResult);
  });

  test('maps view custom_mappings from form tuples to API record', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      enabled: true,
      match: { field: 'field', operator: 'equals', value: 'value' },
      views: [
        {
          standard: 'sigma',
          custom_mappings: [
            ['EventID', 'event_id'],
            ['UserName', 'user_name'],
          ],
        },
      ],
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.views).toEqual([
      {
        standard: 'sigma',
        custom_mappings: {
          EventID: 'event_id',
          UserName: 'user_name',
        },
      },
    ]);
  });
});
