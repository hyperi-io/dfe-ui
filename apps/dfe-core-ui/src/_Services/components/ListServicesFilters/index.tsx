import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListServicesContext } from '@/core/contexts/ListServicesContext';
import { ListServicesFilterForm } from './ListServicesFilterForm';

export const ListServicesFilters = () => {
  const {
    data: { items: services, total },
  } = useListServicesContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <p className="font-semibold">Filters</p>
          <p className="text-xs text-gray-400 mr-4">
            {services.length} of {total}{' '}
            {services.length > 1 ? 'results' : 'result'}
          </p>
        </span>
      }
      className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
    >
      {({ setOpen }) => (
        <ListServicesFilterForm onSuccess={() => setOpen(false)} />
      )}
    </SimpleCollapse>
  );
};
