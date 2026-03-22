import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { ListSourcesFilterForm } from './ListSourcesFilterForm';

export const ListSourcesFilters = () => {
  const {
    data: { items: sources, total },
  } = useListSourcesContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <p className="font-semibold">Filters</p>
          <p className="text-xs text-gray-400 mr-4">
            {sources.length} of {total}{' '}
            {sources.length > 1 ? 'results' : 'result'}
          </p>
        </span>
      }
      className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
    >
      {({ setOpen }) => (
        <ListSourcesFilterForm onSuccess={() => setOpen(false)} />
      )}
    </SimpleCollapse>
  );
};
