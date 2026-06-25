import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { RuleListItem } from '@/core/hooks/useFetchInfiniteFilteredRules/types';
import { cn } from '@/core/utils/style';
import { Spin } from 'antd';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

export const RulesList = ({ className }: { className?: string }) => {
  const {
    data: { items: rules },
    error,
    isLoading,
    loadMoreRef,
    isFetchingNextPage,
    selectedRuleName,
    setSelectedRuleName,
    filters,
    hasFilters,
    setFilters,
  } = useListRulesContext();

  if (isLoading && rules.length === 0) {
    return (
      <div className={cn('flex justify-center py-8', className)}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return <ErrorList className={className} message={error.message} />;
  }

  if (rules.length === 0) {
    return (
      <EmptyList
        className={className}
        hasFilters={hasFilters}
        setFilters={setFilters}
        defaultFilters={{
          ...filters,
          search: undefined,
          severity: undefined,
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
      {rules.map((rule: RuleListItem) => {
        const isSelected = selectedRuleName === rule.name;
        return (
          <li key={rule.name} className="w-full">
            <button
              type="button"
              className={cn(
                'overflow-hidden',
                'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex px-2 py-1 hover:cursor-pointer rounded-md',
                isSelected && 'bg-gray-200 dark:bg-gray-700',
              )}
              onClick={() => setSelectedRuleName(rule.name)}
            >
              <dl className="w-full min-w-0">
                <dt className="font-medium truncate">
                  {rule.display_name ?? rule.name}
                </dt>
                <dd className="text-sm text-gray-500 capitalize truncate dark:text-gray-400">
                  {rule.severity}
                  {rule.hunt_name ? ` · ${rule.hunt_name}` : ''}
                </dd>
              </dl>
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
