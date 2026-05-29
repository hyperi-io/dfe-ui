import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { ListSchemasFilterForm } from './ListSchemasFilterForm';

export const ListSchemasFilters = () => {
  const {
    data: { items: schemas, total },
  } = useListSchemasContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <p className="font-semibold">Filters</p>
          <p className="text-xs text-gray-400 mr-4">
            {schemas.length} of {total}{' '}
            {schemas.length > 1 ? 'results' : 'result'}
          </p>
        </span>
      }
      className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
    >
      {({ setOpen }) => (
        <ListSchemasFilterForm onSuccess={() => setOpen(false)} />
      )}
    </SimpleCollapse>
  );
};
