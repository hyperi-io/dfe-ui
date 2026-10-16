import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { ListHuntsFilterForm } from './ListHuntsFilterForm';

export const ListHuntsFilters = ({
  onCollapseChange,
}: {
  onCollapseChange?: (open: boolean) => void;
}) => {
  const {
    data: { items: hunts, total },
  } = useListHuntsContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex items-center justify-between w-full">
          <p className="font-semibold">Filters</p>
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
