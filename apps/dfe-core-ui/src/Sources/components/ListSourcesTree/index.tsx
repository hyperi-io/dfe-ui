import { ListSourcesFilters } from '@/Sources/components/ListSourcesFilters';
import { SourceList } from './SourceList';

export const ListSourcesTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <ListSourcesFilters className="z-20" />
      <SourceList className="mt-10" />
    </div>
  );
};
