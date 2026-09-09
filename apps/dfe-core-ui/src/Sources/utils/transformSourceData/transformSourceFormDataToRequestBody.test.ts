import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TSourceUpdateRequestBody } from '@/Sources/hooks/useUpdateSource/types';
import { describe, expect, test } from 'vitest';
import { transformSourceFormDataToRequestBody } from './transformSourceFormDataToRequestBody';

describe('transformSourceFormDataToRequestBody', () => {
  test('a receiver source sends its match rule and no fetcher', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      display_name: 'display name',
      enabled: true,
      archive: false,
      origin: 'receiver',
      match: { field: 'field', value: 'value', operator: 'equals' },
      fetcher: { source_type: 'crates_io', topic: 'own', config: 'crates: []' },
    };

    const result = transformSourceFormDataToRequestBody(source);

    const expectedResult: TSourceUpdateRequestBody = {
      source: 'source',
      display_name: 'display name',
      enabled: true,
      archive: false,
      fetcher: null,
      match: { field: 'field', operator: 'equals', value: 'value' },
    };
    expect(result).toEqual(expectedResult);
  });

  test('a fetcher source sends its stanza as an object and no match', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      enabled: true,
      archive: false,
      origin: 'fetcher',
      match: { field: 'field', value: 'value', operator: 'equals' },
      fetcher: {
        source_type: 'crates_io',
        topic: 'default',
        config: 'crates:\n  - dfe-fetcher\ninterval_secs: 3600\n',
      },
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.match).toBeNull();
    expect(result.fetcher).toEqual({
      source_type: 'crates_io',
      topic: 'default',
      config: { crates: ['dfe-fetcher'], interval_secs: 3600 },
    });
  });

  test('an empty config is an empty stanza, not a missing one', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      enabled: true,
      archive: false,
      origin: 'fetcher',
      fetcher: { source_type: 'okta', topic: 'own', config: '' },
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.fetcher).toEqual({
      source_type: 'okta',
      topic: 'own',
      config: {},
    });
  });

  test('topic falls back to own when the form never set it', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      enabled: true,
      archive: false,
      origin: 'fetcher',
      fetcher: { source_type: 'okta' },
    };

    expect(transformSourceFormDataToRequestBody(source).fetcher?.topic).toBe(
      'own',
    );
  });

  test('maps view custom_mappings from form tuples to API record', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      enabled: true,
      archive: false,
      origin: 'receiver',
      match: { field: 'field', operator: 'equals', value: 'value' },
      views: [
        {
          standard: 'sigma',
          custom_mappings: [
            { key: 'EventID', value: 'event_id' },
            { key: 'UserName', value: 'user_name' },
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
