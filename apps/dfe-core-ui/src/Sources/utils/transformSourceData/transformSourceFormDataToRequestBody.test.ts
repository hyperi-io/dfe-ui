import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
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

    // A single condition sends the three keys it always has, and nothing else.
    expect(result).toStrictEqual({
      source: 'source',
      display_name: 'display name',
      enabled: true,
      archive: false,
      fetcher: null,
      match: { field: 'field', operator: 'equals', value: 'value' },
    });
  });

  test('grouped conditions send all or any, with negate only where it is set', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'cisco-ios',
      enabled: true,
      archive: false,
      origin: 'receiver',
      receiver_ui_config: { table: 'main', match_mode: 'conditions' },
      match: {
        join: 'all',
        parts: [
          {
            field: 'data_stream.dataset',
            operator: 'equals',
            value: 'cisco_ios.log',
            negate: false,
          },
          {
            field: 'agent.type',
            operator: 'equals',
            value: 'winlogbeat',
            negate: true,
          },
        ],
      },
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.match).toStrictEqual({
      all: [
        {
          field: 'data_stream.dataset',
          operator: 'equals',
          value: 'cisco_ios.log',
        },
        {
          field: 'agent.type',
          operator: 'equals',
          value: 'winlogbeat',
          negate: true,
        },
      ],
    });
    expect(result).not.toHaveProperty('when');
  });

  test('a none-of group is any with negate', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'quiet',
      enabled: true,
      archive: false,
      origin: 'receiver',
      match: {
        join: 'any',
        negate: true,
        parts: [{ field: 'level', operator: 'equals', value: 'debug' }],
      },
    };

    expect(transformSourceFormDataToRequestBody(source).match).toStrictEqual({
      any: [{ field: 'level', operator: 'equals', value: 'debug' }],
      negate: true,
    });
  });

  test('an expression sends when in place of match', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'okta',
      enabled: true,
      archive: false,
      origin: 'receiver',
      receiver_ui_config: { table: 'main', match_mode: 'expression' },
      match: { field: 'stale', operator: 'equals', value: 'left over' },
      when: "  data_stream.dataset == 'okta.system' ",
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.match).toBeNull();
    expect(result.when).toBe("data_stream.dataset == 'okta.system'");
  });

  test('a fetcher source sends neither match nor when', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'crates',
      enabled: true,
      archive: false,
      origin: 'fetcher',
      receiver_ui_config: { match_mode: 'expression' },
      when: 'true',
      fetcher: { source_type: 'crates_io', topic: 'own', config: '' },
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.match).toBeNull();
    expect(result).not.toHaveProperty('when');
  });

  test('compatibility bindings travel by the mode the form chose', () => {
    const base: CreateUpdateSourceFormData = {
      source: 'legacy',
      enabled: true,
      archive: false,
      origin: 'receiver',
      match: { field: 'field', operator: 'equals', value: 'value' },
    };

    expect(transformSourceFormDataToRequestBody(base)).not.toHaveProperty(
      'compat_profiles',
    );
    expect(
      transformSourceFormDataToRequestBody({
        ...base,
        receiver_ui_config: { compat_mode: 'inherit' },
        compat_profiles: [{ profile: 'dfe-legacy-2x' }],
      }).compat_profiles,
    ).toBeNull();
    expect(
      transformSourceFormDataToRequestBody({
        ...base,
        receiver_ui_config: { compat_mode: 'own' },
        compat_profiles: [{ profile: 'dfe-legacy-2x', version: '1.0.0' }],
      }).compat_profiles,
    ).toStrictEqual([{ profile: 'dfe-legacy-2x', version: '1.0.0' }]);
  });

  test('aliases send only the profiles that hold values', () => {
    const result = transformSourceFormDataToRequestBody({
      source: 'legacy',
      enabled: true,
      archive: false,
      origin: 'receiver',
      match: { field: 'field', operator: 'equals', value: 'value' },
      aliases: { 'dfe-legacy-2x': ['firewall', 'fw'], 'elastic-agent': [] },
    });

    expect(result.aliases).toStrictEqual({
      'dfe-legacy-2x': ['firewall', 'fw'],
    });
  });

  test('a blank engine is sent empty, which follows the DFE default', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',

      enabled: true,
      archive: false,
      origin: 'receiver',
      match: { field: 'field', value: 'value', operator: 'equals' },
      schema: { meta_schema: 'meta/a', meta_schema_version: '1.0.0' },
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.schema).toEqual({
      meta_schema: 'meta/a',
      meta_schema_version: '1.0.0',
      engine: '',
    });
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
        topic: 'main',
        config: 'crates:\n  - dfe-fetcher\ninterval_secs: 3600\n',
      },
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result.match).toBeNull();
    expect(result.fetcher).toEqual({
      source_type: 'crates_io',
      topic: 'main',
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

  test('No Transform sends a null transform, whatever the form still holds', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      enabled: true,
      archive: false,
      origin: 'receiver',
      match: { field: 'field', operator: 'equals', value: 'value' },
      transform: { engine: 'vrl' },
      transform_ui_config: { assign: 'none' },
    };

    const result = transformSourceFormDataToRequestBody(source);

    expect(result).toHaveProperty('transform', null);
    expect(result).not.toHaveProperty('transform_ui_config');
  });

  test('a form that never showed the Transform tab leaves transform out', () => {
    const source: CreateUpdateSourceFormData = {
      source: 'source',
      enabled: true,
      archive: false,
      origin: 'receiver',
      match: { field: 'field', operator: 'equals', value: 'value' },
    };

    expect(transformSourceFormDataToRequestBody(source)).not.toHaveProperty(
      'transform',
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
