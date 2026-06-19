import { ListFieldMapsFilters } from '@/_FieldMaps/components/ListFieldMapsFilters';
import { FieldMapsList } from './FieldMapsList';

export const FieldMapsTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <ListFieldMapsFilters />
      <FieldMapsList className="mt-10" />
    </div>
  );
};
