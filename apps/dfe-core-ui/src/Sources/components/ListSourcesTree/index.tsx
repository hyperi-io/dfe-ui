import { ListSourcesFilters } from '@/Sources/components/ListSourcesFilters';
import { useState } from 'react';
import { SourceList } from './SourceList';

export const ListSourcesTree = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 relative">
      <ListSourcesFilters onCollapseChange={(open) => setIsFiltersOpen(open)} />
      <SourceList isFiltersOpen={isFiltersOpen} />
    </div>
  );
};
