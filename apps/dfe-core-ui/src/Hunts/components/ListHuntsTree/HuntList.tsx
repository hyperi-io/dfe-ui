import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { HuntListItem } from '@/Hunts/hooks/useFetchInfiniteFilteredHunts/types';
import { cn } from '@/core/utils/style';
import { Spin } from 'antd';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

export const HuntList = ({ className }: { className?: string }) => {
  const {
    data: { items: hunts },
    error,
    isLoading,
    loadMoreRef,
    isFetchingNextPage,
    selectedHuntId,
    setSelectedHuntId,
    filters,
    hasFilters,
    setFilters,
  } = useListHuntsContext();

  if (isLoading && hunts.length === 0) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return <ErrorList className={className} message={error.message} />;
  }

  if (hunts.length === 0) {
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

  return (
    <ul
      className={cn(
        'h-[calc(100vh-175px)] css-custom-scrollbar flex flex-col gap-2 pt-2',
        className,
      )}
    >
      {hunts.map((hunt: HuntListItem) => {
        const isSelected = selectedHuntId === hunt.hunt_id;
        return (
          <li key={hunt.hunt_id} className="w-full">
            <button
              type="button"
              className={cn(
                'overflow-hidden',
                'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex px-2 py-1 hover:cursor-pointer rounded-md',
                isSelected && 'bg-gray-200 dark:bg-gray-700',
              )}
              onClick={() => setSelectedHuntId(hunt.hunt_id)}
            >
              {hunt.name}
            </button>
          </li>
        );
      })}
      <div ref={loadMoreRef} className="flex justify-center h-4">
        {isFetchingNextPage && <Spin size="small" />}
      </div>
    </ul>
  );
};
