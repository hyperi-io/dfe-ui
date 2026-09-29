import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { describe, expect, test } from 'vitest';
import { transformSourceFormDataToRequestBody } from './transformSourceFormDataToRequestBody';
import { transformSourceRequestBodyToFormData } from './transformSourceRequestBodyToFormData';

describe('transformSourceRequestBodyToFormData', () => {
  test('a version carrying a fetcher is fetcher-based, with the stanza as YAML', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      resource_type: 'custom',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      state: 'active',
      version: {
        date_time: 'string',
        archive: false,
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
      config: 'crates:\n  - dfe-fetcher\ninterval_secs: 3600\n',
    });
    expect(result._assignSchema).toBe('default');
    expect(result.source).toBe('source');
    expect(result.display_name).toBe('display name');
    expect(result.enabled).toBe(false);
  });

  test('a version carrying a match rule is receiver-based', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      resource_type: 'custom',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      state: 'active',
      version: {
        date_time: 'string',
        archive: false,
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

  const oktaFetcher = {
    source_type: 'okta',
    topic: 'own' as const,
    config: {
      connections: [{ domain: 'example.okta.com', token: 'vault:okta:token' }],
      interval_secs: 300,
    },
  };

  test('a fetcher source with a meta schema keeps its own topic through an edit', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      resource_type: 'custom',
      enabled: true,
      current: '1.0.0',
      versions: ['1.0.0'],
      selected: '1.0.0',
      state: 'active',
      version: {
        date_time: 'string',
        archive: false,
        fetcher: oktaFetcher,
        schema: {
          meta_schema: 'meta/okta',
          meta_schema_version: '1.0.0',
          engine: '',
        },
      },
    };

    const formData = transformSourceRequestBodyToFormData(source);
    const requestBody = transformSourceFormDataToRequestBody(formData);

    expect(formData._assignSchema).toBe('define_schema');
    expect(requestBody.fetcher).toEqual(oktaFetcher);
  });

  test('a fetcher source with no schema is moved onto main by an edit', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      resource_type: 'custom',
      enabled: true,
      current: '1.0.0',
      versions: ['1.0.0'],
      selected: '1.0.0',
      state: 'active',
      version: { date_time: 'string', archive: false, fetcher: oktaFetcher },
    };

    const formData = transformSourceRequestBodyToFormData(source);
    const requestBody = transformSourceFormDataToRequestBody(formData);

    expect(formData._assignSchema).toBe('default');
    expect(requestBody.fetcher).toEqual({ ...oktaFetcher, topic: 'main' });
  });

  test('when the version has no origin at all, it falls back to receiver', () => {
    const source: TSourceVersionDetail = {
      source: 'source',
      resource_type: 'custom',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      state: 'active',
      version: {
        date_time: 'string',
        archive: false,
        header: { type: 'string', version: 'string' },
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.origin).toBe('receiver');
    expect(result.fetcher).toBeNull();
    expect(result.header).toEqual({ type: 'string', version: 'string' });
  });
});
