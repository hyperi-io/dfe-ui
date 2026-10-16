import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { cn } from '@/core/utils/style';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { ListSourcesFilterForm } from './ListSourcesFilterForm';

export const ListSourcesFilters = ({
  onCollapseChange,
}: {
  onCollapseChange?: (open: boolean) => void;
}) => {
  const {
    data: { items: sources, total },
  } = useListSourcesContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <p className="font-semibold">Filters</p>
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
