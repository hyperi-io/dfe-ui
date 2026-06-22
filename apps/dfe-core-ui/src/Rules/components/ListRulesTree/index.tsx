import { ListRulesFilters } from '@/Rules/components/ListRulesFilters';
import { RulesList } from './RulesList';

export const ListRulesTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <ListRulesFilters />
      <RulesList className="mt-10" />
    </div>
  );
};
