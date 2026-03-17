import { FieldMapSummary } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps/types';
import { cn } from '@/core/utils/style';
import { Spin } from 'antd';
import { useListFieldMapsContext } from '../../contexts/ListFieldMapsContext';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

export const FieldMapsList = ({ className }: { className?: string }) => {
  const {
    data: { items: fieldMaps },
    error,
    loadMoreRef,
    isFetchingNextPage,
    selectedFieldMap,
    setSelectedFieldMap,
    filters,
    hasFilters,
    setFilters,
  } = useListFieldMapsContext();

  if (fieldMaps.length === 0) {
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
        {fieldMaps.map((fieldMap: FieldMapSummary) => {
          const isSelected =
            selectedFieldMap?.map_source === fieldMap.source &&
            selectedFieldMap?.map_standard === fieldMap.standard;
          return (
            <li
              key={`${fieldMap.standard}-${fieldMap.source ?? '_default'}`}
              className="w-full"
            >
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    'overflow-hidden',
                    'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex [&_span]:w-full px-2 py-0.5 hover:cursor-pointer rounded-md',
                    isSelected && 'bg-gray-200 dark:bg-gray-700',
                  )}
                  onClick={() => {
                    setSelectedFieldMap({
                      map_source: fieldMap.source ?? null,
                      map_standard: fieldMap.standard,
                    });
                  }}
                >
                  <dl>
                    <dt className="truncate ellipsis">{fieldMap.standard}</dt>
                    <dd className="text-sm text-gray-500 dark:text-gray-400 truncate ellipsis">
                      {fieldMap.source ?? '_default'}
                    </dd>
                  </dl>
                </button>
              </div>
            </li>
          );
        })}
        <div ref={loadMoreRef} className="h-4 flex justify-center">
          {isFetchingNextPage && <Spin size="small" />}
        </div>
      </>
    </ul>
  );
};
