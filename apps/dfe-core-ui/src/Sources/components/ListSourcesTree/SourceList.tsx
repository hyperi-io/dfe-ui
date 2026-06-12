import { cn } from '@/core/utils/style';
import { EmptyList } from '@/Sources/components/ListSourcesTree/EmptyList';
import { ErrorList } from '@/Sources/components/ListSourcesTree/ErrorList';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { Spin, Tree } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import {
  getExpandedKeysForSourceSelection,
  useTransformSourceToTree,
} from './hooks/useTransformSourceToTree';

export const SourceList = ({ className }: { className?: string }) => {
  const {
    data: { items: sources, objects: sourceObjects },
    error,
    loadMoreRef,
    isFetchingNextPage,
    setSelectedSource,
    refetch: refetchSources,
    selectedSourceName,
    selectedSourceVersion,
    filters,
    hasFilters,
    setFilters,
  } = useListSourcesContext();

  const [userExpandedKeys, setUserExpandedKeys] = useState<string[]>([]);

  const expandTreeNode = useCallback((key: string) => {
    setUserExpandedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const { tree: treeData, notificationContextHolder } =
    useTransformSourceToTree({
      sourceObjects,
      setSelectedSource,
      selectedSourceName,
      selectedSourceVersion,
      expandTreeNode,
      refetchSources,
    });

  const expandedKeysForSelection = useMemo(
    () =>
      getExpandedKeysForSourceSelection(
        selectedSourceName,
        selectedSourceVersion,
      ),
    [selectedSourceName, selectedSourceVersion],
  );

  const expandedKeys = useMemo(
    () => [...new Set([...userExpandedKeys, ...expandedKeysForSelection])],
    [userExpandedKeys, expandedKeysForSelection],
  );

  if (sources.length === 0) {
    return (
      <EmptyList
        className={className}
        hasFilters={hasFilters}
        setFilters={setFilters}
        defaultFilters={{
          ...filters,
          search: undefined,
        }}
      />
    );
  }

  if (error) {
    return <ErrorList className={className} message={error.message} />;
  }

  return (
    <>
      {notificationContextHolder}
      <div
        className={cn(
          'h-[calc(100vh-175px)] css-custom-scrollbar flex flex-col gap-2 pt-2',
          className,
        )}
      >
        <Tree
          blockNode
          className={cn(
            // Chevron expand alignment center
            '[&_.ant-tree-switcher]:m-auto',
            // Tree node content wrapper for truncated items in tree
            '[&_.ant-tree-node-content-wrapper]:min-w-0!',
          )}
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setUserExpandedKeys(keys as string[])}
        />
        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </div>
    </>
  );
};
