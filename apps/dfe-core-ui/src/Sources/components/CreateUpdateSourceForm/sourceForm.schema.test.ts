import { describe, expect, test } from 'vitest';
import { CreateUpdateSourceFormData, formSchema } from './sourceForm.schema';

const BASE = {
  source: 'crates-audit',
  enabled: true,
  archive: false,
} satisfies Pick<CreateUpdateSourceFormData, 'source' | 'enabled' | 'archive'>;

const messagesAt = (
  data: CreateUpdateSourceFormData,
  path: (string | number)[],
) => {
  const result = formSchema.safeParse(data);
  if (result.success) return [];
  return result.error.issues
    .filter(
      (issue) =>
        issue.path.length === path.length &&
        issue.path.every((part, index) => String(part) === String(path[index])),
    )
    .map((issue) => issue.message);
};

describe('formSchema source details', () => {
  test('a source carrying no archive decision is refused', () => {
    const { archive: _archive, ...withoutArchive } = BASE;
    const data = {
      ...withoutArchive,
      origin: 'receiver',
      match: { field: '_json.app', operator: 'equals', value: 'kv-proof' },
    } as CreateUpdateSourceFormData;

    expect(messagesAt(data, ['archive'])).toEqual(['Archive is required']);
  });
});

describe('formSchema meta schema', () => {
  // A clone or an edit seeds an absent meta schema as '', where a create leaves it unset.
  test('an empty meta schema is refused as an unset one is', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      origin: 'fetcher',
      fetcher: { source_type: 'crates_io', topic: 'own', config: '' },
      schema: { meta_schema: '', meta_schema_version: '' },
    };

    expect(messagesAt(data, ['schema', 'meta_schema'])).toEqual([
      'Meta schema is required',
    ]);
    expect(messagesAt(data, ['schema', 'meta_schema_version'])).toEqual([
      'Meta schema version is required',
    ]);
  });
});

describe('formSchema origin', () => {
  test('a receiver source needs its match rule and ignores the fetcher block', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'receiver',
      match: { field: '_json.app', operator: 'equals', value: 'kv-proof' },
      fetcher: { source_type: '', topic: 'own', config: '' },
    };

    expect(formSchema.safeParse(data).success).toBe(true);
  });

  test('a receiver source with no match rule is refused field by field', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'receiver',
      match: { field: '', operator: undefined, value: '' },
    };

    expect(messagesAt(data, ['match', 'field'])).toContain('Field is required');
    expect(messagesAt(data, ['match', 'operator'])).toEqual([
      'Operator is required',
    ]);
  });

  test('alias fields left empty still let the match be checked', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      origin: 'receiver',
      match: { field: '_json.app', operator: 'equals', value: '' },
      aliases: { 'dfe-legacy-2x': undefined, 'elastic-agent': null },
    };

    expect(messagesAt(data, ['match', 'value'])).toEqual(['Value is required']);
  });

  test('the exists operator needs no value; every other operator does', () => {
    const exists: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'receiver',
      match: { field: '_json.app', operator: 'exists', value: '' },
    };
    expect(formSchema.safeParse(exists).success).toBe(true);

    const equals: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'receiver',
      match: { field: '_json.app', operator: 'equals', value: '' },
    };
    expect(messagesAt(equals, ['match', 'value'])).toEqual([
      'Value is required',
    ]);
  });

  test('a fetcher source needs a source type and ignores the match block', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
        topic: 'own',
        config: 'crates:\n  - dfe-fetcher\n',
      },
    };

    expect(formSchema.safeParse(data).success).toBe(true);
  });

  test('a fetcher source with no source type is refused', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'fetcher',
      fetcher: { source_type: '', topic: 'own', config: '' },
    };

    expect(messagesAt(data, ['fetcher', 'source_type'])).toEqual([
      'Source type is required',
    ]);
  });

  test('config that is not YAML is a form error rather than a request', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
        topic: 'own',
        config: 'crates: [unterminated',
      },
    };

    expect(messagesAt(data, ['fetcher', 'config'])).toHaveLength(1);
  });

  test('config that is not a mapping is refused', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
        topic: 'own',
        config: '- one\n- two\n',
      },
    };

    expect(messagesAt(data, ['fetcher', 'config'])).toEqual([
      'Config must be a YAML mapping of keys',
    ]);
  });

  test('the two keys the engine sets are refused in the config', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,

      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
        topic: 'own',
        config: 'enabled: true\ntopic: elsewhere\n',
      },
    };

    expect(messagesAt(data, ['fetcher', 'config'])).toEqual([
      'The engine sets enabled and topic; remove them from the config',
    ]);
  });
});

describe('formSchema grouped conditions', () => {
  const receiver = (
    match: CreateUpdateSourceFormData['match'],
  ): CreateUpdateSourceFormData => ({ ...BASE, origin: 'receiver', match });

  test('each blank in a nested condition is refused where the form shows it', () => {
    const data = receiver({
      join: 'all',
      parts: [
        { field: 'data_stream.dataset', operator: 'equals', value: '' },
        {
          join: 'any',
          parts: [{ field: '', operator: 'exists', value: '' }],
        },
      ],
    });

    expect(messagesAt(data, ['match', 'parts', 0, 'value'])).toEqual([
      'Value is required',
    ]);
    expect(
      messagesAt(data, ['match', 'parts', 1, 'parts', 0, 'field']),
    ).toEqual(['Field is required']);
    // exists compares nothing, so its empty value is not a blank.
    expect(
      messagesAt(data, ['match', 'parts', 1, 'parts', 0, 'value']),
    ).toEqual([]);
  });

  test('a group with no condition is refused', () => {
    expect(
      messagesAt(receiver({ join: 'any', parts: [] }), ['match', 'parts']),
    ).toEqual(['A group needs at least one condition']);
  });

  test('groups nested past the engine limit are refused', () => {
    let node: NonNullable<CreateUpdateSourceFormData['match']> = {
      field: 'a',
      operator: 'equals',
      value: 'b',
    };
    for (let level = 0; level < 5; level += 1) {
      node = { join: 'all', parts: [node] };
    }

    expect(messagesAt(receiver(node), ['match', 'parts'])).toEqual([
      'Groups nest at most 4 deep',
    ]);
  });

  test('a complete grouped match passes', () => {
    const data = receiver({
      join: 'all',
      parts: [
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

    expect(formSchema.safeParse(data).success).toBe(true);
  });
});

describe('formSchema expression', () => {
  test('an expression source needs its expression and leaves the conditions alone', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      origin: 'receiver',
      receiver_ui_config: { match_mode: 'expression' },
      match: { field: '', operator: 'equals', value: '' },
      when: '   ',
    };

    expect(messagesAt(data, ['when'])).toEqual(['Expression is required']);
    expect(messagesAt(data, ['match', 'field'])).toEqual([]);
  });
});
