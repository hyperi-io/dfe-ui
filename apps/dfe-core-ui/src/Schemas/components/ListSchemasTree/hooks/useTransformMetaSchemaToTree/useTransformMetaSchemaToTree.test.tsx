import {
  TSchemaListResponse,
  TSchemaSummary,
} from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  getExpandedKeysForSchemaSelection,
  useTransformMetaSchemaToTree,
} from '.';

type SchemaSummaryObject = TSchemaSummary;

const baseSchema = (
  overrides: Partial<SchemaSummaryObject> & Pick<SchemaSummaryObject, 'name'>,
): SchemaSummaryObject => ({
  resource_type: 'custom',
  current: 'v1',
  versions: ['v1'],
  updated_at: '',
  column_count: 0,
  ...overrides,
});

const defaultSelection = {
  selectedSchemaPath: null as string | null,
  selectedSchemaVersion: null as string | null,
  expandTreeNode: vi.fn(),
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
    ).toEqual([
      'dir:azure',
      'dir:azure.activity_log',
      'schema:azure/activity_log/schema1',
    ]);
  });

  it('returns only folder keys when no version is selected', () => {
    expect(
      getExpandedKeysForSchemaSelection('azure/activity_log/schema1', null),
    ).toEqual(['dir:azure', 'dir:azure.activity_log']);
  });

  it('returns schema key only for a root-level schema with a version', () => {
    expect(getExpandedKeysForSchemaSelection('solo.schema', 'v1')).toEqual([
      'schema:solo.schema',
    ]);
  });
});

describe('useTransformMetaSchemaToTree', () => {
  it('returns an empty tree for empty objects', () => {
    const setSelectedSchema = vi.fn();
    const { result } = renderHook(() =>
      useTransformMetaSchemaToTree({
        schemaObjects: {},
        setSelectedSchema,
        ...defaultSelection,
      }),
    );

    const { tree } = result.current;
    expect(tree).toEqual([]);
  });

  it('maps nested children and schemas into TreeDataNode keys and hierarchy', () => {
    const setSelectedSchema = vi.fn();

    const schema_objects: TSchemaListResponse['objects'] = {
      items: [],
      children: {
        azure: {
          items: [],
          children: {
            activity_log: {
              items: [
                baseSchema({
                  name: 'azure/activity_log/schema1',
                  versions: ['v1', 'v2'],
                  current: 'v1',
                }),
              ],
            },
            security_log: {
              items: [
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
      useTransformMetaSchemaToTree({
        schemaObjects: schema_objects,
        setSelectedSchema,
        ...defaultSelection,
      }),
    );

    const { tree } = result.current;

    expect(tree).toHaveLength(1);
    expect(tree[0].key).toBe('dir:azure');
    expectTreeNodeTitle(tree[0].title as ReactElement, 'azure');

    const azureChildren = tree[0].children!;
    expect(azureChildren).toHaveLength(2);
    // Sorted alphabetically: activity_log before security_log
    expect(azureChildren[0].key).toBe('dir:azure.activity_log');
    expectTreeNodeTitle(azureChildren[0].title as ReactElement, 'activity_log');
    expect(azureChildren[1].key).toBe('dir:azure.security_log');
    expectTreeNodeTitle(azureChildren[1].title as ReactElement, 'security_log');

    const activityLog = azureChildren[0].children!;
    expect(activityLog).toHaveLength(1);
    expect(activityLog[0].key).toBe('schema:azure/activity_log/schema1');
    expect(activityLog[0].isLeaf).toBe(false);
    const versionNodes = activityLog[0].children!;
    expect(versionNodes).toHaveLength(2);
    expect(versionNodes[0].key).toBe('schema:azure/activity_log/schema1@v1');
    expect(versionNodes[1].key).toBe('schema:azure/activity_log/schema1@v2');

    const securityLeaf = azureChildren[1].children![0];
    expect(securityLeaf.key).toBe('schema:azure/security_log/alerts');
    expect(securityLeaf.isLeaf).toBe(true);
    expect(securityLeaf.children).toBeUndefined();
  });

  it('lists root-level schemas with no children', () => {
    const { result } = renderHook(() =>
      useTransformMetaSchemaToTree({
        schemaObjects: {
          items: [baseSchema({ name: 'solo.schema', versions: [] })],
        },
        setSelectedSchema: vi.fn(),
        ...defaultSelection,
      }),
    );

    const { tree } = result.current;

    expect(tree).toHaveLength(1);
    expect(tree[0].key).toBe('schema:solo.schema');
    expect(tree[0].isLeaf).toBe(true);
  });

  it('uses distinct keys when a root schema and folder share the same name', () => {
    const { result } = renderHook(() =>
      useTransformMetaSchemaToTree({
        schemaObjects: {
          items: [baseSchema({ name: 'test', versions: ['v1'] })],
          children: {
            test: {
              items: [baseSchema({ name: 'test/nested', versions: ['v1'] })],
            },
          },
        },
        setSelectedSchema: vi.fn(),
        ...defaultSelection,
      }),
    );

    const keys = result.current.tree.map((node) => node.key);
    expect(keys).toEqual(['schema:test', 'dir:test']);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('memoises the tree when schemaObjects and setters are stable', () => {
    const schema_objects: TSchemaListResponse['objects'] = {
      items: [baseSchema({ name: 'a' })],
    };
    const setSelectedSchema = vi.fn();
    const expandTreeNode = vi.fn();

    const { result, rerender } = renderHook(
      ({
        schema,
        onSelect,
        onExpand,
      }: {
        schema: TSchemaListResponse['objects'];
        onSelect: typeof setSelectedSchema;
        onExpand: typeof expandTreeNode;
      }) =>
        useTransformMetaSchemaToTree({
          schemaObjects: schema,
          setSelectedSchema: onSelect,
          selectedSchemaPath: null,
          selectedSchemaVersion: null,
          expandTreeNode: onExpand,
        }),
      {
        initialProps: {
          schema: schema_objects,
          onSelect: setSelectedSchema,
          onExpand: expandTreeNode,
        },
      },
    );

    const { tree: firstTree } = result.current;
    rerender({
      schema: schema_objects,
      onSelect: setSelectedSchema,
      onExpand: expandTreeNode,
    });
    expect(result.current.tree).toBe(firstTree);

    const nextObjects: TSchemaListResponse['objects'] = {
      items: [baseSchema({ name: 'b' })],
    };
    rerender({
      schema: nextObjects,
      onSelect: setSelectedSchema,
      onExpand: expandTreeNode,
    });
    expect(result.current.tree[0].key).toBe('schema:b');
    expect(result.current.tree).not.toEqual(firstTree);
  });
});
