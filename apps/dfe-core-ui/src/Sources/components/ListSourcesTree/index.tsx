import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { ListSourcesFilterForm } from '../ListSourcesFilterForm';
import { SourceList } from './SourceList';

export const ListSourcesTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <SimpleCollapse
        title="Filters"
        className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
      >
        <ListSourcesFilterForm />
      </SimpleCollapse>
      <SourceList className="mt-14" />
    </div>
  );
};
