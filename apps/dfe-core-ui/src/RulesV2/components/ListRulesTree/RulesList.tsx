import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useListRulesContext } from '@/core/contexts/ListRulesContextV2';
import { TRuleListItem } from '@/core/hooks/useFetchInfiniteFilteredRulesV2/types';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { IconUrgent } from '@repo/dfe-icons';
import { Tooltip } from '@repo/dfe-shared-ui';
import { Spin } from 'antd';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';

const SeverityIcon = ({
  severity,
}: {
  severity: TRuleListItem['severity'];
}) => {
  const severityColor = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };
  return (
    <Tooltip title={`Severity: ${severity}`}>
      <span
        className={cn(
          'rounded-full p-0.5 text-white',
          severityColor[severity as keyof typeof severityColor] ||
            'text-gray-500',
        )}
      >
        <IconUrgent className="w-4 h-4" />
      </span>
    </Tooltip>
  );
};

export const RulesList = ({
  className,
  isFiltersOpen,
}: {
  className?: string;
  isFiltersOpen?: boolean;
}) => {
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

  const filtersHeight = isFiltersOpen ? 215 : 0;
  const { componentHeight } = useSetComponentHeight({
    offset: 175 + filtersHeight,
  });

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
    <CustomScrollbar height={componentHeight}>
      <ul className={cn('flex flex-col gap-2 pt-2', className)}>
        {rules.map((rule: TRuleListItem) => {
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
                  <dt className="font-medium truncate flex items-center gap-2">
                    {rule.severity && <SeverityIcon severity={rule.severity} />}{' '}
                    {rule.display_name ?? rule.name}
                  </dt>

                  <dd
                    className={cn(
                      'text-[13px] capitalize truncate',
                      rule.description && 'text-gray-500 dark:text-gray-400',
                      !rule.description && 'text-gray-400 dark:text-gray-500',
                    )}
                  >
                    {rule.description || 'No description'}
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
    </CustomScrollbar>
  );
};
