import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Tooltip } from '@/core/components/Tooltip';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { Tag } from 'antd';
import { ListRulesFilterForm } from './ListRulesFilterForm';

export const ListRulesFilters = ({
  onCollapseChange,
}: {
  onCollapseChange?: (open: boolean) => void;
}) => {
  const {
    data: { items: rules, total },
    hasFilters,
    filters,
  } = useListRulesContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <span className="flex items-center gap-2">
            <p className="font-semibold">Filters</p>
            {hasFilters && (
              <Tooltip
                title={Object.entries(filters)
                  .filter(([_, value]) => value !== undefined)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
              >
                <Tag color="green">Active Filters</Tag>
              </Tooltip>
            )}
          </span>
          <p className="text-xs text-gray-400 mr-4">
            {rules.length} of {total} {total === 1 ? 'result' : 'results'}
          </p>
        </span>
      }
      className="bg-background dark:bg-dark-background"
      onCollapseChange={onCollapseChange}
    >
      {({ setOpen }) => (
        <ListRulesFilterForm
          onSuccess={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      )}
    </SimpleCollapse>
  );
};
