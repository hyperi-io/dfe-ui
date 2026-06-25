import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { ListHuntsFilterForm } from './ListHuntsFilterForm';

export const ListHuntsFilters = () => {
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
      className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
    >
      {({ setOpen }) => (
        <ListHuntsFilterForm onSuccess={() => setOpen(false)} />
      )}
    </SimpleCollapse>
  );
};
