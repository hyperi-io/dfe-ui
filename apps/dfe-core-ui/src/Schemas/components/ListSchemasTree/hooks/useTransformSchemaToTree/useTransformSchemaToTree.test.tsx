import { SchemaSummary } from '@/Schemas/hooks/useFetchInfiniteFilteredSchemas/types';
import { components } from '@repo/dfe-engine-types';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getExpandedKeysForSchemaSelection, useTransformSchemaToTree } from '.';

type SchemaSummaryObject = components['schemas']['SchemaSummaryObject'];

const baseSchema = (
  overrides: Partial<SchemaSummaryObject> & Pick<SchemaSummaryObject, 'name'>,
): SchemaSummaryObject => ({
  current: 'v1',
  versions: ['v1'],
  updated_at: '',
  column_count: 0,
  ...overrides,
});

const defaultSelection = {
  selectedSchemaPath: null as string | null,
  selectedSchemaVersion: null as string | null,
};

const expectTreeNodeTitle = (
  title: ReactElement | string,
  expectedText: string,
) => {
  const { container } = render(<>{title}</>);
  expect(container).toHaveTextContent(expectedText);
};

describe('getExpandedKeysForSchemaSelection', () => {
  it('returns folder keys and schema key for a nested path with a version', () => {
    expect(
      getExpandedKeysForSchemaSelection('azure/activity_log/schema1', 'v1'),
    ).toEqual(['azure', 'azure.activity_log', 'azure/activity_log/schema1']);
  });

  it('returns only folder keys when no version is selected', () => {
    expect(
      getExpandedKeysForSchemaSelection('azure/activity_log/schema1', null),
    ).toEqual(['azure', 'azure.activity_log']);
  });

  it('returns schema key only for a root-level schema with a version', () => {
    expect(getExpandedKeysForSchemaSelection('solo.schema', 'v1')).toEqual([
      'solo.schema',
    ]);
  });
});

describe('useTransformSchemaToTree', () => {
  it('returns an empty tree for empty schema_objects', () => {
    const setSelectedSchema = vi.fn();
    const { result } = renderHook(() =>
      useTransformSchemaToTree({
        schemaObjects: {},
        setSelectedSchema,
        ...defaultSelection,
      }),
    );

    expect(result.current).toEqual([]);
  });

  it('maps nested children and schemas into TreeDataNode keys and hierarchy', () => {
    const setSelectedSchema = vi.fn();

    const schema_objects: SchemaSummary = {
      children: {
        azure: {
          schemas: [],
          children: {
            activity_log: {
              schemas: [
                baseSchema({
                  name: 'azure/activity_log/schema1',
                  versions: ['v1', 'v2'],
                  current: 'v1',
                }),
              ],
            },
            security_log: {
              schemas: [
                baseSchema({
                  name: 'azure/security_log/alerts',
                  current: 'v1',
                  versions: [],
                }),
              ],
            },
          },
        },
      },
    };

    const { result } = renderHook(() =>
      useTransformSchemaToTree({
        schemaObjects: schema_objects,
        setSelectedSchema,
        ...defaultSelection,
      }),
    );

    const tree = result.current;

    expect(tree).toHaveLength(1);
    expect(tree[0].key).toBe('azure');
    expectTreeNodeTitle(tree[0].title as ReactElement, 'azure');

    const azureChildren = tree[0].children!;
    expect(azureChildren).toHaveLength(2);
    // Sorted alphabetically: activity_log before security_log
    expect(azureChildren[0].key).toBe('azure.activity_log');
    expectTreeNodeTitle(
      azureChildren[0].title as ReactElement,
      'activity_log',
    );
    expect(azureChildren[1].key).toBe('azure.security_log');
    expectTreeNodeTitle(
      azureChildren[1].title as ReactElement,
      'security_log',
    );

    const activityLog = azureChildren[0].children!;
    expect(activityLog).toHaveLength(1);
    expect(activityLog[0].key).toBe('azure/activity_log/schema1');
    expect(activityLog[0].isLeaf).toBe(false);
    const versionNodes = activityLog[0].children!;
    expect(versionNodes).toHaveLength(2);
    expect(versionNodes[0].key).toBe('azure/activity_log/schema1.v1');
    expect(versionNodes[1].key).toBe('azure/activity_log/schema1.v2');

    const securityLeaf = azureChildren[1].children![0];
    expect(securityLeaf.key).toBe('azure/security_log/alerts');
    expect(securityLeaf.isLeaf).toBe(true);
    expect(securityLeaf.children).toBeUndefined();
  });

  it('lists root-level schemas with no children', () => {
    const { result } = renderHook(() =>
      useTransformSchemaToTree({
        schemaObjects: {
          schemas: [baseSchema({ name: 'solo.schema', versions: [] })],
        },
        setSelectedSchema: vi.fn(),
        ...defaultSelection,
      }),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].key).toBe('solo.schema');
    expect(result.current[0].isLeaf).toBe(true);
  });

  it('memoises the tree when schemaObjects and setters are stable', () => {
    const schema_objects: SchemaSummary = {
      schemas: [baseSchema({ name: 'a' })],
    };
    const setSelectedSchema = vi.fn();

    const { result, rerender } = renderHook(
      ({
        schema,
        onSelect,
      }: {
        schema: SchemaSummary;
        onSelect: typeof setSelectedSchema;
      }) =>
        useTransformSchemaToTree({
          schemaObjects: schema,
          setSelectedSchema: onSelect,
          selectedSchemaPath: null,
          selectedSchemaVersion: null,
        }),
      {
        initialProps: {
          schema: schema_objects,
          onSelect: setSelectedSchema,
        },
      },
    );

    const first = result.current;
    rerender({
      schema: schema_objects,
      onSelect: setSelectedSchema,
    });
    expect(result.current).toBe(first);

    const nextObjects: SchemaSummary = {
      schemas: [baseSchema({ name: 'b' })],
    };
    rerender({
      schema: nextObjects,
      onSelect: setSelectedSchema,
    });
    expect(result.current[0].key).toBe('b');
    expect(result.current).not.toBe(first);
  });
});
