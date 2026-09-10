import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { describe, expect, test } from 'vitest';
import { transformSourceFormDataToRequestBody } from './transformSourceFormDataToRequestBody';
import { transformSourceRequestBodyToFormData } from './transformSourceRequestBodyToFormData';

describe('transformSourceRequestBodyToFormData', () => {
  test('a version carrying a fetcher is fetcher-based, with the stanza as YAML', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      state: 'active',
      version: {
        date_time: 'string',
        fetcher: {
          source_type: 'crates_io',
          topic: 'main',
          config: { crates: ['dfe-fetcher'], interval_secs: 3600 },
        },
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.origin).toBe('fetcher');
    expect(result.fetcher).toEqual({
      source_type: 'crates_io',
      topic: 'main',
      config: 'crates:\n  - dfe-fetcher\ninterval_secs: 3600\n',
    });
    expect(result.source).toBe('source');
    expect(result.display_name).toBe('display name');
    expect(result.enabled).toBe(false);
  });

  test('a version carrying a match rule is receiver-based', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      state: 'active',
      version: {
        date_time: 'string',
        match: { field: 'field', value: 'value', operator: 'equals' },
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.origin).toBe('receiver');
    expect(result.fetcher).toBeNull();
    expect(result.match).toEqual({
      field: 'field',
      value: 'value',
      operator: 'equals',
    });
  });

  test('a fetcher stanza survives the round trip back to the API shape', () => {
    const fetcher = {
      source_type: 'okta',
      topic: 'own' as const,
      config: {
        connections: [
          { domain: 'example.okta.com', token: 'vault:okta:token' },
        ],
        interval_secs: 300,
      },
    };
    const source: TSourceVersionDetail = {
      source: 'source',
      enabled: true,
      current: '1.0.0',
      versions: ['1.0.0'],
      selected: '1.0.0',
      state: 'active',
      version: { date_time: 'string', fetcher },
    };

    const formData = transformSourceRequestBodyToFormData(source);
    const requestBody = transformSourceFormDataToRequestBody(formData);

    expect(requestBody.fetcher).toEqual(fetcher);
  });

  test('when the version has no origin at all, it falls back to receiver', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      state: 'active',
      version: {
        date_time: 'string',
        header: { type: 'string', version: 'string' },
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.origin).toBe('receiver');
    expect(result.fetcher).toBeNull();
    expect(result.header).toEqual({ type: 'string', version: 'string' });
  });
});
