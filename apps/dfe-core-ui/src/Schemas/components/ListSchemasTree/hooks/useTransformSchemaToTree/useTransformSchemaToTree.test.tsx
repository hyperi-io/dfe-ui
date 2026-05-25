import { SchemaSummary } from '@/Schemas/hooks/useFetchInfiniteFilteredSchemas/types';
import { components } from '@repo/dfe-engine-types';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTransformSchemaToTree } from '.';

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

describe('useTransformSchemaToTree', () => {
  it('returns an empty tree for empty schema_objects', () => {
    const setSelectedSchema = vi.fn();
    const { result } = renderHook(() =>
      useTransformSchemaToTree({
        schemaObjects: {},
        setSelectedSchema,
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
      }),
    );

    const tree = result.current;

    expect(tree).toHaveLength(1);
    expect(tree[0].key).toBe('azure');
    expect(tree[0].title).toBe('azure');

    const azureChildren = tree[0].children!;
    expect(azureChildren).toHaveLength(2);
    // Sorted alphabetically: activity_log before security_log
    expect(azureChildren[0].key).toBe('azure.activity_log');
    expect(azureChildren[0].title).toBe('activity_log');
    expect(azureChildren[1].key).toBe('azure.security_log');
    expect(azureChildren[1].title).toBe('security_log');

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
