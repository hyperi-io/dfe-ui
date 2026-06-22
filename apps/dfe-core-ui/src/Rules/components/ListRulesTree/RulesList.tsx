import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { RuleListItem } from '@/Rules/hooks/useFetchInfiniteFilteredRules/types';
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
    selectedRuleId,
    setSelectedRuleId,
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
        const isSelected = selectedRuleId === rule.rule_id;
        return (
          <li key={rule.rule_id} className="w-full">
            <button
              type="button"
              className={cn(
                'overflow-hidden',
                'hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left items-center flex px-2 py-1 hover:cursor-pointer rounded-md',
                isSelected && 'bg-gray-200 dark:bg-gray-700',
              )}
              onClick={() => setSelectedRuleId(rule.rule_id)}
            >
              <dl className="min-w-0 w-full">
                <dt className="truncate font-medium">{rule.name}</dt>
                <dd className="text-sm text-gray-500 dark:text-gray-400 truncate capitalize">
                  {rule.severity}
                  {rule.hunt_name ? ` · ${rule.hunt_name}` : ''}
                </dd>
              </dl>
            </button>
          </li>
        );
      })}
      <div ref={loadMoreRef} className="h-4 flex justify-center">
        {isFetchingNextPage && <Spin size="small" />}
      </div>
    </ul>
  );
};
