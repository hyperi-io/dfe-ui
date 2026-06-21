import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { ListRulesFilterForm } from './ListRulesFilterForm';

export const ListRulesFilters = () => {
  const {
    data: { items: rules, total },
  } = useListRulesContext();

  return (
    <SimpleCollapse
      title={
        <span className="flex justify-between items-center w-full">
          <p className="font-semibold">Filters</p>
          <p className="text-xs text-gray-400 mr-4">
            {rules.length} of {total}{' '}
            {total === 1 ? 'result' : 'results'}
          </p>
        </span>
      }
      className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
    >
      {({ setOpen }) => (
        <ListRulesFilterForm onSuccess={() => setOpen(false)} />
      )}
    </SimpleCollapse>
  );
};
