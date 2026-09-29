import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { THuntListItem } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
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
    selectedHuntName,
    setSelectedHuntName,
    filters,
    hasFilters,
    setFilters,
  } = useListHuntsContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 175,
  });

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
    <CustomScrollbar height={componentHeight}>
      <ul className={cn('h-full flex flex-col gap-2 pt-2', className)}>
        {hunts.map((hunt: THuntListItem) => {
          const isSelected = selectedHuntName === hunt.name;
          return (
            <li key={hunt.name} className="w-full">
              <button
                type="button"
                className={cn(
                  'overflow-hidden',
                  'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex px-2 py-1 hover:cursor-pointer rounded-md',
                  isSelected && 'bg-gray-200 dark:bg-gray-700',
                )}
                onClick={() => setSelectedHuntName(hunt.name)}
              >
                {hunt.display_name}
              </button>
            </li>
          );
        })}
        <div ref={loadMoreRef} className="flex justify-center h-4">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </ul>
    </CustomScrollbar>
  );
};
