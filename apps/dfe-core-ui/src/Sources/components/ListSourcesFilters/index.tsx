import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { Tag } from 'antd';
import { ListSourcesFilterForm } from './ListSourcesFilterForm';

export const ListSourcesFilters = ({
  onCollapseChange,
}: {
  onCollapseChange?: (open: boolean) => void;
}) => {
  const {
    data: { items: sources, total },
    hasFilters,
    filters,
  } = useListSourcesContext();

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
            {sources.length} of {total} {total === 1 ? 'result' : 'results'}
          </p>
        </span>
      }
      className={cn('bg-background dark:bg-dark-background')}
      onCollapseChange={onCollapseChange}
    >
      {({ setOpen }) => (
        <ListSourcesFilterForm
          onSuccess={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      )}
    </SimpleCollapse>
  );
};
