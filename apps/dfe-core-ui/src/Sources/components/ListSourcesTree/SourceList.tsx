import { cn } from '@/core/utils/style';
import { CloneSourceModal } from '@/Sources/components/CloneSourceModal';
import { DeleteSourceModal } from '@/Sources/components/DeleteSourceModal';
import { EmptyList } from '@/Sources/components/ListSourcesTree/EmptyList';
import { ErrorList } from '@/Sources/components/ListSourcesTree/ErrorList';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { Spin, Tooltip } from 'antd';

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
    <ul
      className={cn(
        'h-[calc(100vh-175px)] css-custom-scrollbar flex flex-col gap-2 pt-2',
        className,
      )}
    >
      <>
        {sources.map((source) => (
          <li key={source.source} className="w-full">
            <Tooltip destroyOnHidden title={source.description}>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    'overflow-hidden',
                    'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex [&_span]:w-full px-2 py-0.5 hover:cursor-pointer rounded-md',
                    selectedSourceName === source.source &&
                      'bg-gray-200 dark:bg-gray-700',
                  )}
                  onClick={() => {
                    setSelectedSourceName(source.source);
                  }}
                >
                  <dl>
                    <dt className="truncate ellipsis">{source.display_name}</dt>
                    <dd className="text-sm text-gray-500 dark:text-gray-400 truncate ellipsis">
                      {source.source}
                    </dd>
                  </dl>
                </button>
                <div className="flex items-center gap-1">
                  <CloneSourceModal
                    source={source}
                    onSuccess={({ source }) => {
                      setSelectedSourceName(source);
                      refetchSources();
                    }}
                  />
                  <DeleteSourceModal
                    source={source.source}
                    onSuccess={() => {
                      setSelectedSourceName(null);
                      refetchSources();
                    }}
                  />
                </div>
              </div>
            </Tooltip>
          </li>
        ))}
        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </>
    </ul>
  );
};
