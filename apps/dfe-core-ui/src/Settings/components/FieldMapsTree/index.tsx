import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { ListFieldMapsFilterForm } from '../ListFieldMapsFilterForm';
import { FieldMapsList } from './FieldMapsList';

export const FieldMapsTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <SimpleCollapse
        title="Filters"
        className="absolute top-0 left-0 z-10 bg-background dark:bg-dark-background"
      >
        <ListFieldMapsFilterForm />
      </SimpleCollapse>
      <FieldMapsList className="mt-14" />
    </div>
  );
};
