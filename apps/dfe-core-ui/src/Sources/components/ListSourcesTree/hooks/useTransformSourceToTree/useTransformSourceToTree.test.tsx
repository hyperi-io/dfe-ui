import {
  TSourceListSummary,
  TSourceSummary,
} from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getExpandedKeysForSourceSelection, useTransformSourceToTree } from '.';

// CloneSourceDrawer transitively loads AceEditor, which needs a global `ace` ClientContext sets.
vi.mock('@/Sources/components/CloneSourceDrawer', () => ({
  CloneSourceDrawer: () => null,
}));

const refetchSources = vi.fn();

const baseSource = (
  overrides: Partial<TSourceListSummary> & Pick<TSourceListSummary, 'name'>,
): TSourceListSummary => ({
  //@ts-expect-error - name is specified more than once, so this usage will be overwritten.
  name: 'source',
  display_name: 'Source',
  enabled: true,
  current: 'v1',
  deployed_version: 'v1',
  versions: ['v1'],
  updated_at: '',
  has_transform: false,
  has_fetcher: false,
  state: 'active',
  ...overrides,
});

const defaultSelection = {
  refetchSources,
  selectedSourcePath: null as string | null,
  selectedSourceVersion: null as string | null,
  expandTreeNode: vi.fn(),
};

const expectTreeNodeTitle = (
  title: ReactElement | string,
  expectedText: string,
) => {
  const { container } = render(<>{title}</>);
  expect(container).toHaveTextContent(expectedText);
};

describe('getExpandedKeysForSourceSelection', () => {
  it('returns folder keys and source key for a nested path with a version', () => {
    expect(
      getExpandedKeysForSourceSelection('azure/activity_log/source1', 'v1'),
    ).toEqual([
      'dir:azure',
      'dir:azure.activity_log',
      'source:azure/activity_log/source1',
    ]);
  });

  it('returns only folder keys when no version is selected', () => {
    expect(
      getExpandedKeysForSourceSelection('azure/activity_log/source1', null),
    ).toEqual(['dir:azure', 'dir:azure.activity_log']);
  });

  it('returns source key only for a root-level source with a version', () => {
    expect(getExpandedKeysForSourceSelection('solo.source', 'v1')).toEqual([
      'source:solo.source',
    ]);
  });
});

describe('useTransformSourceToTree', () => {
  it('returns an empty tree for empty objects', () => {
    const setSelectedSource = vi.fn();
    const { result } = renderHook(() =>
      useTransformSourceToTree({
        sourceObjects: {},
        setSelectedSource,
        selectedSourceName: null,
        ...defaultSelection,
      }),
    );

    const { tree } = result.current;
    expect(tree).toEqual([]);
  });

  it('maps nested children and sources into TreeDataNode keys and hierarchy', () => {
    const setSelectedSource = vi.fn();

    // Version nodes only include entries matching current or deployed_version.
    const source_objects: TSourceSummary = {
      items: [],
      children: {
        azure: {
          items: [],
          children: {
            activity_log: {
              items: [
                baseSource({
                  name: 'azure/activity_log/source1',
                  versions: ['v1', 'v2'],
                  current: 'v2',
                  deployed_version: 'v1',
                }),
              ],
            },
            security_log: {
              items: [
                baseSource({
                  name: 'azure/security_log/source2',
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
      useTransformSourceToTree({
        sourceObjects: source_objects,
        setSelectedSource,
        selectedSourceName: null,
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
    expect(activityLog[0].key).toBe('source:azure/activity_log/source1');
    expect(activityLog[0].isLeaf).toBe(false);
    const versionNodes = activityLog[0].children!;
    expect(versionNodes).toHaveLength(2);
    expect(versionNodes[0].key).toBe('source:azure/activity_log/source1@v1');
    expect(versionNodes[1].key).toBe('source:azure/activity_log/source1@v2');

    const securityLeaf = azureChildren[1].children![0];
    expect(securityLeaf.key).toBe('source:azure/security_log/source2');
    expect(securityLeaf.isLeaf).toBe(true);
    expect(securityLeaf.children).toBeUndefined();
  });

  it('lists root-level sources with no children', () => {
    const { result } = renderHook(() =>
      useTransformSourceToTree({
        sourceObjects: {
          items: [baseSource({ name: 'solo.source', versions: [] })],
        },
        setSelectedSource: vi.fn(),
        selectedSourceName: null,
        ...defaultSelection,
      }),
    );

    const { tree } = result.current;

    expect(tree).toHaveLength(1);
    expect(tree[0].key).toBe('source:solo.source');
    expect(tree[0].isLeaf).toBe(true);
  });

  it('uses distinct keys when a root source and folder share the same name', () => {
    const { result } = renderHook(() =>
      useTransformSourceToTree({
        sourceObjects: {
          items: [baseSource({ name: 'test', versions: ['v1'] })],
          children: {
            test: {
              items: [baseSource({ name: 'test/nested', versions: ['v1'] })],
            },
          },
        },
        selectedSourceName: null,
        setSelectedSource: vi.fn(),
        ...defaultSelection,
      }),
    );

    const keys = result.current.tree.map((node) => node.key);
    expect(keys).toEqual(['source:test', 'dir:test']);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('memoises the tree when sourceObjects and setters are stable', () => {
    const source_objects: TSourceSummary = {
      items: [baseSource({ name: 'a' })],
    };
    const setSelectedSource = vi.fn();
    const expandTreeNode = vi.fn();

    const { result, rerender } = renderHook(
      ({
        source,
        onSelect,
        onExpand,
      }: {
        source: TSourceSummary;
        onSelect: typeof setSelectedSource;
        onExpand: typeof expandTreeNode;
      }) =>
        useTransformSourceToTree({
          refetchSources,
          sourceObjects: source,
          setSelectedSource: onSelect,
          selectedSourceName: null,
          selectedSourceVersion: null,
          expandTreeNode: onExpand,
        }),
      {
        initialProps: {
          source: source_objects,
          onSelect: setSelectedSource,
          onExpand: expandTreeNode,
        },
      },
    );

    const { tree: firstTree } = result.current;
    rerender({
      source: source_objects,
      onSelect: setSelectedSource,
      onExpand: expandTreeNode,
    });
    expect(result.current.tree).toBe(firstTree);

    const nextObjects: TSourceSummary = {
      items: [baseSource({ name: 'b' })],
    };
    rerender({
      source: nextObjects,
      onSelect: setSelectedSource,
      onExpand: expandTreeNode,
    });
    expect(result.current.tree[0].key).toBe('source:b');
    expect(result.current.tree).not.toEqual(firstTree);
  });
});
