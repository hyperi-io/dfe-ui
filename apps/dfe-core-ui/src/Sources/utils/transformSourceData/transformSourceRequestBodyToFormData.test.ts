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
      current_table_topic_type: 'own',
      version: {
        date_time: 'string',
        archive: false,
        fetcher: {
          source_type: 'crates_io',
          topic: 'main',
          config: { crates: ['dfe-fetcher'], interval_secs: 3600 },
        },
        origin: 'fetcher',
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
      resource_type: 'custom',
      display_name: 'display name',
      enabled: false,
      current: 'string',
      versions: ['string'],
      selected: 'string',
      state: 'active',
      current_table_topic_type: 'own',
      version: {
        date_time: 'string',
        archive: false,
        match: {
          field: 'field',
          value: 'value',
          operator: 'equals',
          negate: false,
        },
        origin: 'receiver',
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.origin).toBe('receiver');
    expect(result.fetcher).toBeNull();
    expect(result.match).toStrictEqual({
      field: 'field',
      value: 'value',
      operator: 'equals',
    });
    expect(result.receiver_ui_config?.match_mode).toBe('conditions');
  });

  test('a grouped match opens as a group of the same conditions', () => {
    const source: TSourceVersionDetail = {
      source: 'cisco-ios',
      resource_type: 'custom',
      enabled: true,
      current: '1.0.0',
      versions: ['1.0.0'],
      selected: '1.0.0',
      state: 'active',
      current_table_topic_type: 'main',
      version: {
        date_time: 'string',
        archive: false,
        origin: 'receiver',
        match: {
          value: '',
          negate: false,
          all: [
            {
              field: 'data_stream.dataset',
              operator: 'equals',
              value: 'cisco_ios.log',
              negate: false,
            },
            {
              value: '',
              negate: true,
              any: [
                {
                  field: 'agent.type',
                  operator: 'equals',
                  value: 'winlogbeat',
                  negate: false,
                },
              ],
            },
          ],
        },
      },
    };

    const formData = transformSourceRequestBodyToFormData(source);
    expect(formData.match).toStrictEqual({
      join: 'all',
      parts: [
        {
          field: 'data_stream.dataset',
          operator: 'equals',
          value: 'cisco_ios.log',
        },
        {
          join: 'any',
          negate: true,
          parts: [
            { field: 'agent.type', operator: 'equals', value: 'winlogbeat' },
          ],
        },
      ],
    });

    expect(transformSourceFormDataToRequestBody(formData).match).toStrictEqual({
      all: [
        {
          field: 'data_stream.dataset',
          operator: 'equals',
          value: 'cisco_ios.log',
        },
        {
          any: [
            { field: 'agent.type', operator: 'equals', value: 'winlogbeat' },
          ],
          negate: true,
        },
      ],
    });
  });

  test('a CEL Fast source opens on the expression and saves it as when', () => {
    const source: TSourceVersionDetail = {
      source: 'okta',
      resource_type: 'custom',
      enabled: true,
      current: '1.0.0',
      versions: ['1.0.0'],
      selected: '1.0.0',
      state: 'active',
      current_table_topic_type: 'main',
      version: {
        date_time: 'string',
        archive: false,
        origin: 'receiver',
        when: "data_stream.dataset == 'okta.system'",
      },
    };

    const formData = transformSourceRequestBodyToFormData(source);
    expect(formData.receiver_ui_config?.match_mode).toBe('expression');

    const body = transformSourceFormDataToRequestBody(formData);
    expect(body.when).toBe("data_stream.dataset == 'okta.system'");
    expect(body.match).toBeNull();
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
      resource_type: 'custom',
      enabled: true,
      current: '1.0.0',
      versions: ['1.0.0'],
      selected: '1.0.0',
      state: 'active',
      current_table_topic_type: 'own',
      version: {
        date_time: 'string',
        archive: false,
        fetcher,
        origin: 'fetcher',
      },
    };

    const formData = transformSourceRequestBodyToFormData(source);
    const requestBody = transformSourceFormDataToRequestBody(formData);

    expect(requestBody.fetcher).toEqual(fetcher);
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
      current_table_topic_type: 'own',
      version: {
        date_time: 'string',
        archive: false,
        header: { type: 'string', version: 'string' },
        origin: 'receiver',
      },
    };
    const result = transformSourceRequestBodyToFormData(source);

    expect(result.origin).toBe('receiver');
    expect(result.fetcher).toBeNull();
    expect(result.header).toEqual({ type: 'string', version: 'string' });
  });
});
