import { ListSchemasFilters } from '@/Schemas/components/ListSchemasFilters';
import { useState } from 'react';
import { SchemaList } from './SchemaList';

export const ListSchemasTree = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 relative">
      <ListSchemasFilters onCollapseChange={(open) => setIsFiltersOpen(open)} />
      <SchemaList isFiltersOpen={isFiltersOpen} />
    </div>
  );
};
