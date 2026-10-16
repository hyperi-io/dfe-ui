import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Tooltip } from '@/core/components/Tooltip';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { Tag } from 'antd';
import { ListHuntsFilterForm } from './ListHuntsFilterForm';

export const ListHuntsFilters = ({
  onCollapseChange,
}: {
  onCollapseChange?: (open: boolean) => void;
}) => {
  const {
    data: { items: hunts, total },
    hasFilters,
    filters,
  } = useListHuntsContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex items-center justify-between w-full">
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
          <p className="mr-4 text-xs text-gray-400">
            {hunts.length} of {total} {total === 1 ? 'result' : 'results'}
          </p>
        </span>
      }
      className="z-10 bg-background dark:bg-dark-background"
      onCollapseChange={onCollapseChange}
    >
      {({ setOpen }) => {
        return (
          <ListHuntsFilterForm
            onSuccess={() => {
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        );
      }}
    </SimpleCollapse>
  );
};
