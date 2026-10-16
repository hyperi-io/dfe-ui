import { ListHuntsFilters } from '@/Hunts/components/ListHuntsFilters';
import { useState } from 'react';
import { HuntList } from './HuntList';

export const ListHuntsTree = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="relative flex flex-col gap-2">
      <ListHuntsFilters
        onCollapseChange={(open) => {
          setIsFiltersOpen(open);
        }}
      />
      <HuntList isFiltersOpen={isFiltersOpen} />
    </div>
  );
};
