import { DeleteSchemaVersionModal } from '@/Schemas/components/DeleteSchemaVersionModal';
import { TreeInteractiveLabel } from '@/Schemas/components/ListSchemasTree/TreeInteractiveLabel';
import {
  TSchemaListResponse,
  TSchemaSummary,
} from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { render, renderHook } from '@testing-library/react';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  getExpandedKeysForSchemaSelection,
  useTransformMetaSchemaToTree,
} from '.';

const findByType = <P extends object>(
  node: ReactNode,
  type: unknown,
): ReactElement<P> | undefined => {
  if (node == null || typeof node === 'boolean') {
    return undefined;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByType<P>(child, type);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
  if (!isValidElement(node)) {
    return undefined;
  }
  if (node.type === type) {
    return node as ReactElement<P>;
  }
  const props = node.props as Record<string, unknown>;
  return (
    findByType<P>(props.children as ReactNode, type) ??
    findByType<P>(props.actions as ReactNode, type)
  );
};

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

  it('attaches delete version actions to version tree items', () => {
    const { result } = renderHook(() =>
      useTransformMetaSchemaToTree({
        schemaObjects: {
          items: [
            baseSchema({
              name: 'custom.schema',
              versions: ['v1', 'v2'],
              current: 'v1',
            }),
          ],
        },
        setSelectedSchema: vi.fn(),
        ...defaultSelection,
      }),
    );

    const schemaNode = result.current.tree[0];
    const versionNodes = schemaNode.children!;

    const v1Delete = findByType(
      versionNodes[0].title as ReactElement,
      DeleteSchemaVersionModal,
    );
    expect(v1Delete?.props).toMatchObject({
      schemaPath: 'custom.schema',
      version: 'v1',
    });

    const v2Delete = findByType(
      versionNodes[1].title as ReactElement,
      DeleteSchemaVersionModal,
    );
    expect(v2Delete?.props).toMatchObject({
      schemaPath: 'custom.schema',
      version: 'v2',
    });

    expect(
      findByType(schemaNode.title as ReactElement, DeleteSchemaVersionModal),
    ).toBeUndefined();
  });

  it('highlights the schema row when a non-current version is selected', () => {
    const { result } = renderHook(() =>
      useTransformMetaSchemaToTree({
        schemaObjects: {
          items: [
            baseSchema({
              name: 'custom.schema',
              versions: ['v1', 'v2'],
              current: 'v1',
            }),
          ],
        },
        setSelectedSchema: vi.fn(),
        selectedSchemaPath: 'custom.schema',
        selectedSchemaVersion: 'v2',
        expandTreeNode: vi.fn(),
      }),
    );

    const label = findByType<{ selected?: boolean }>(
      result.current.tree[0].title as ReactElement,
      TreeInteractiveLabel,
    );
    expect(label?.props.selected).toBe(true);
  });

  it('highlights ancestor folders when a nested schema is selected', () => {
    const { result } = renderHook(() =>
      useTransformMetaSchemaToTree({
        schemaObjects: {
          children: {
            azure: {
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
              },
            },
          },
        },
        setSelectedSchema: vi.fn(),
        selectedSchemaPath: 'azure/activity_log/schema1',
        selectedSchemaVersion: 'v2',
        expandTreeNode: vi.fn(),
      }),
    );

    const azureFolder = result.current.tree[0];
    const activityLogFolder = azureFolder.children![0];
    const schemaNode = activityLogFolder.children![0];

    expect(
      findByType<{ selected?: boolean }>(
        azureFolder.title as ReactElement,
        TreeInteractiveLabel,
      )?.props.selected,
    ).toBe(true);
    expect(
      findByType<{ selected?: boolean }>(
        activityLogFolder.title as ReactElement,
        TreeInteractiveLabel,
      )?.props.selected,
    ).toBe(true);
    expect(
      findByType<{ selected?: boolean }>(
        schemaNode.title as ReactElement,
        TreeInteractiveLabel,
      )?.props.selected,
    ).toBe(true);
  });

  it('highlights folders when the meta root is stripped but schema paths still include meta/', () => {
    // SchemaList passes children.meta as the tree root while selection keeps
    // the full schema.name (meta/...). Folder segments must start with meta.
    const { result } = renderHook(() =>
      useTransformMetaSchemaToTree({
        schemaObjects: {
          children: {
            test: {
              children: {
                test: {
                  items: [
                    baseSchema({
                      name: 'meta/test/test/test',
                      versions: ['1.0.0'],
                      current: '1.0.0',
                    }),
                  ],
                },
              },
            },
          },
        },
        rootPathSegments: ['meta'],
        setSelectedSchema: vi.fn(),
        selectedSchemaPath: 'meta/test/test/test',
        selectedSchemaVersion: '1.0.0',
        expandTreeNode: vi.fn(),
      }),
    );

    const outerFolder = result.current.tree[0];
    const innerFolder = outerFolder.children![0];

    expect(outerFolder.key).toBe('dir:meta.test');
    expect(innerFolder.key).toBe('dir:meta.test.test');
    expect(
      findByType<{ selected?: boolean }>(
        outerFolder.title as ReactElement,
        TreeInteractiveLabel,
      )?.props.selected,
    ).toBe(true);
    expect(
      findByType<{ selected?: boolean }>(
        innerFolder.title as ReactElement,
        TreeInteractiveLabel,
      )?.props.selected,
    ).toBe(true);
  });
});
