import { EmptyList } from '@/Sources/components/ListSourcesTree/EmptyList';
import { ErrorList } from '@/Sources/components/ListSourcesTree/ErrorList';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { cn } from '@/core/utils/style';
import { Spin, Tree } from 'antd';
import { useTransformSourceToTree } from './hooks/useTransformSourceToTree';

export const SourceList = ({ className }: { className?: string }) => {
  const {
    data: { items: sources },
    error,
    loadMoreRef,
    isFetchingNextPage,
    selectedSourceName,
    refetch: refetchSources,
    setSelectedSourceName,
    filters,
    hasFilters,
    setFilters,
  } = useListSourcesContext();

  const { tree: treeData, notificationContextHolder } =
    useTransformSourceToTree({
      sources,
      setSelectedSourceName,
      selectedSourceName,
      refetchSources,
    });

  if (sources.length === 0) {
    return (
      <EmptyList
        className={className}
        hasFilters={hasFilters}
        setFilters={setFilters}
        defaultFilters={{
          ...filters,
          search: undefined,
          enabled: undefined,
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
          showIcon={false}
          className={cn(
            '[&_.ant-tree-switcher]:m-0! [&_.ant-tree-switcher]:flex [&_.ant-tree-switcher]:shrink-0 [&_.ant-tree-switcher]:items-center [&_.ant-tree-switcher]:justify-center',
            '[&_.ant-tree-switcher-noop]:hidden',
            '[&_.ant-tree-node-content-wrapper]:min-w-0!',
          )}
          treeData={treeData}
        />
        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </div>
    </>
  );
};
