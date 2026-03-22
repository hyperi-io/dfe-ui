import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListFieldMapsContext } from '@/core/contexts/ListFieldMapsContext';
import { ListFieldMapsFilterForm } from './ListFieldMapsFilterForm';

export const ListFieldMapsFilters = () => {
  const {
    data: { items: fieldMaps, total },
  } = useListFieldMapsContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <p className="font-semibold">Filters</p>
          <p className="text-xs text-gray-400 mr-4">
            {fieldMaps.length} of {total}{' '}
            {fieldMaps.length > 1 ? 'results' : 'result'}
          </p>
        </span>
      }
      className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
    >
      {({ setOpen }) => (
        <ListFieldMapsFilterForm onSuccess={() => setOpen(false)} />
      )}
    </SimpleCollapse>
  );
};
