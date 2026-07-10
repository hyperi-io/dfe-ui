import { ListHuntsFilters } from '@/Hunts/components/ListHuntsFilters';
import { HuntList } from './HuntList';

export const ListHuntsTree = () => {
  return (
    <div className="relative flex flex-col gap-2">
      <ListHuntsFilters />
      <HuntList className="mt-10" />
    </div>
  );
};
