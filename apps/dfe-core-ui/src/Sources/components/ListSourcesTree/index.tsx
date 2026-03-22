import { ListSourcesFilters } from '@/Sources/components/ListSourcesFilters';
import { SourceList } from './SourceList';

export const ListSourcesTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <ListSourcesFilters />
      <SourceList className="mt-14" />
    </div>
  );
};
