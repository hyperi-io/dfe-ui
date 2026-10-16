import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { ListSchemasFilterForm } from './ListSchemasFilterForm';

export const ListSchemasFilters = ({
  onCollapseChange,
}: {
  onCollapseChange?: (open: boolean) => void;
}) => {
  const {
    data: { items: schemas, total },
  } = useListSchemasContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <p className="font-semibold">Filters</p>
          <p className="text-xs text-gray-400 mr-4">
            {schemas.length} of {total} {total === 1 ? 'result' : 'results'}
          </p>
        </span>
      }
      className="bg-background dark:bg-dark-background"
      onCollapseChange={onCollapseChange}
    >
      {({ setOpen }) => (
        <ListSchemasFilterForm
          onSuccess={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      )}
    </SimpleCollapse>
  );
};
