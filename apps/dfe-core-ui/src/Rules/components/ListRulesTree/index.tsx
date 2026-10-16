import { ListRulesFilters } from '@/Rules/components/ListRulesFilters';
import { useState } from 'react';
import { RulesList } from './RulesList';

export const ListRulesTree = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 relative">
      <ListRulesFilters onCollapseChange={(open) => setIsFiltersOpen(open)} />
      <RulesList isFiltersOpen={isFiltersOpen} />
    </div>
  );
};
