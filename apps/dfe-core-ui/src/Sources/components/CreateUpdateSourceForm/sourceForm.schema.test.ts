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

describe('formSchema schema', () => {
  test('a defined schema with no meta schema picked is refused', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'define_schema',
      origin: 'receiver',
      match: { field: '_json.app', operator: 'equals', value: 'kv-proof' },
      schema: { meta_schema: '', meta_schema_version: '' },
    };

    expect(messagesAt(data, ['schema', 'meta_schema'])).toEqual([
      'Meta schema is required',
    ]);
    expect(messagesAt(data, ['schema', 'meta_schema_version'])).toEqual([
      'Meta schema version is required',
    ]);
  });

  test('main sends no schema block, so nothing in it is checked', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
      origin: 'receiver',
      match: { field: '_json.app', operator: 'equals', value: 'kv-proof' },
    };

    expect(formSchema.safeParse(data).success).toBe(true);
  });
});

describe('formSchema origin', () => {
  test('a receiver source needs its match rule and ignores the fetcher block', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
      origin: 'receiver',
      match: { field: '_json.app', operator: 'equals', value: 'kv-proof' },
      fetcher: { source_type: '', config: '' },
    };

    expect(formSchema.safeParse(data).success).toBe(true);
  });

  test('a receiver source with no match rule is refused field by field', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
      origin: 'receiver',
      match: { field: '', operator: undefined, value: '' },
    };

    expect(messagesAt(data, ['match', 'field'])).toContain('Field is required');
    expect(messagesAt(data, ['match', 'operator'])).toEqual([
      'Operator is required',
    ]);
  });

  test('the exists operator needs no value; every other operator does', () => {
    const exists: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
      origin: 'receiver',
      match: { field: '_json.app', operator: 'exists', value: '' },
    };
    expect(formSchema.safeParse(exists).success).toBe(true);

    const equals: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
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
      _assignSchema: 'default',
      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
        config: 'crates:\n  - dfe-fetcher\n',
      },
    };

    expect(formSchema.safeParse(data).success).toBe(true);
  });

  test('a fetcher source with no source type is refused', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
      origin: 'fetcher',
      fetcher: { source_type: '', config: '' },
    };

    expect(messagesAt(data, ['fetcher', 'source_type'])).toEqual([
      'Source type is required',
    ]);
  });

  test('config that is not YAML is a form error rather than a request', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
        config: 'crates: [unterminated',
      },
    };

    expect(messagesAt(data, ['fetcher', 'config'])).toHaveLength(1);
  });

  test('config that is not a mapping is refused', () => {
    const data: CreateUpdateSourceFormData = {
      ...BASE,
      _assignSchema: 'default',
      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
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
      _assignSchema: 'default',
      origin: 'fetcher',
      fetcher: {
        source_type: 'crates_io',
        config: 'enabled: true\ntopic: elsewhere\n',
      },
    };

    expect(messagesAt(data, ['fetcher', 'config'])).toEqual([
      'The engine sets enabled and topic; remove them from the config',
    ]);
  });
});
