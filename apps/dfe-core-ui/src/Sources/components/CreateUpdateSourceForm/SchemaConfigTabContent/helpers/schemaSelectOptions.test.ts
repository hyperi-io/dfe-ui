import { components } from '@repo/dfe-engine-types';
import { describe, expect, it } from 'vitest';
import {
  getSchemaLeafName,
  getSchemaPathPrefix,
  schemasToGroupedSelectOptions,
  versionsFromMetaSchemaOutput,
} from './schemaSelectOptions';

type SchemaSummaryObject = components['schemas']['SchemaSummaryObject'];

const schemaEntry = (
  overrides: Partial<SchemaSummaryObject> & Pick<SchemaSummaryObject, 'name'>,
): SchemaSummaryObject => ({
  resource_type: 'custom',
  current: '1.0.0',
  versions: ['1.0.0'],
  updated_at: '',
  column_count: 0,
  ...overrides,
});

describe('schemasToGroupedSelectOptions', () => {
  it('groups schemas under non-selectable path labels', () => {
    const options = schemasToGroupedSelectOptions([
      schemaEntry({ name: 'new/test' }),
      schemaEntry({ name: 'test/test' }),
      schemaEntry({ name: 'test/test_copy' }),
      schemaEntry({ name: 'test1/test' }),
    ]);

    const testGroup = options.find(
      (option) => 'options' in option && option.label === 'test',
    );
    expect(
      testGroup && 'options' in testGroup ? testGroup.options : null,
    ).toEqual([
      { label: 'test', value: 'test/test' },
      { label: 'test_copy', value: 'test/test_copy' },
    ]);
  });

  it('includes root-level schemas as plain selectable options', () => {
    const options = schemasToGroupedSelectOptions([
      schemaEntry({ name: 'solo' }),
    ]);

    expect(options).toEqual([{ label: 'solo', value: 'solo' }]);
  });

  it('uses full path labels for nested folders', () => {
    const options = schemasToGroupedSelectOptions([
      schemaEntry({ name: 'azure/activity_log/events' }),
    ]);

    expect(options).toEqual([
      {
        label: 'azure/activity_log',
        options: [{ label: 'events', value: 'azure/activity_log/events' }],
      },
    ]);
  });
});

describe('getSchemaPathPrefix', () => {
  it('returns the directory prefix with trailing slash', () => {
    expect(getSchemaPathPrefix('test/test')).toBe('test/');
  });

  it('returns empty string for root-level schemas', () => {
    expect(getSchemaPathPrefix('solo')).toBe('');
  });
});

describe('getSchemaLeafName', () => {
  it('returns the last path segment', () => {
    expect(getSchemaLeafName('test/test_copy')).toBe('test_copy');
  });
});

describe('versionsFromMetaSchemaOutput', () => {
  it('returns version keys from the response', () => {
    expect(
      versionsFromMetaSchemaOutput({
        current: '1.0.0',
        versions: {
          '1.0.0': {
            date: '2026-01-01',
            type: 'model',
            summary: 'Initial version',
            columns: [],
          },
        },
      }),
    ).toEqual(['1.0.0']);
  });

  it('falls back to current when versions is empty', () => {
    expect(
      versionsFromMetaSchemaOutput({
        current: '2.0.0',
        versions: {},
      }),
    ).toEqual(['2.0.0']);
  });
});
