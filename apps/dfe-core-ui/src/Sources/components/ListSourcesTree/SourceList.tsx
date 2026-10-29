import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ApiError } from '@/core/config/api/client';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { EmptyList } from '@/Sources/components/ListSourcesTree/EmptyList';
import { ErrorList } from '@/Sources/components/ListSourcesTree/ErrorList';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { Spin, Tree } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useTransformSourceToTree } from './hooks/useTransformSourceToTree';

export const SourceList = ({
  className,
  isFiltersOpen,
}: {
  className?: string;
  isFiltersOpen?: boolean;
}) => {
  const filtersHeight = isFiltersOpen ? 175 : 0;
  const { componentHeight } = useSetComponentHeight({
    offset: 175 + filtersHeight,
  });
  const {
    data: { items: sources, objects: sourceObjects },
    error,
    isLoading,
    loadMoreRef,
    isFetchingNextPage,
    setSelectedSource,
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
    });

  const expandedKeys = useMemo(
    () => [...new Set([...userExpandedKeys])],
    [userExpandedKeys],
  );

  // The sidebar's gate and the engine's can disagree, and the engine wins.
  if (error instanceof ApiError && error.status === 403) {
    return <RbacProtected.RestrictedRoute reason={error.message} />;
  }

  if (error) {
    return <ErrorList className={className} message={error.message} />;
  }

  if (isLoading) {
    return (
      <div className={cn('flex justify-center pt-6', className)}>
        <Spin />
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <EmptyList
        className={className}
        hasFilters={hasFilters}
        setFilters={setFilters}
        defaultFilters={{
          ...filters,
          search: undefined,
          status: undefined,
        }}
      />
    );
  }

  return (
    <>
      {notificationContextHolder}
      <CustomScrollbar
        height={componentHeight}
        className={cn('flex flex-col gap-2 pt-2', className)}
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
      </CustomScrollbar>
    </>
  );
};
