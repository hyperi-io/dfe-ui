import { ListSchemasFilters } from '@/Schemas/components/ListSchemasFilters';
import { SchemaList } from './SchemaList';

export const ListSchemasTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <ListSchemasFilters />
      <SchemaList className="mt-14" />
    </div>
  );
};
