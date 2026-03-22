import { CreateFieldMapDrawer } from '@/core/components/CreateFieldMapDrawer';
import { useListFieldMapsContext } from '@/core/contexts/ListFieldMapsContext';
import { UseFetchInfiniteFilteredFieldMapsProps } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps/types';
import { cn } from '@/core/utils/style';
import { IconInfoCircle } from '@dfe/icons';
import { Button } from 'antd';

export const EmptyList = ({
  hasFilters,
  setFilters,
  defaultFilters,
  className,
}: {
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredFieldMapsProps) => void;
  defaultFilters: UseFetchInfiniteFilteredFieldMapsProps;
  className?: string;
}) => {
  const { setSelectedFieldMap } = useListFieldMapsContext();
  return (
    <div
      className={cn(
        'bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex flex-col items-center gap-2 text-center',
        className,
      )}
    >
      <IconInfoCircle className="w-6 h-6 text-foreground" />
      <div className="flex flex-col">
        <h2 className="text-md font-medium">
          {hasFilters
            ? 'No field maps match your filters'
            : 'No field maps found'}
        </h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {hasFilters
            ? 'Please update your filters to see field maps.'
            : 'Please add a field map to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="default" onClick={() => setFilters(defaultFilters)}>
          Clear Filters
        </Button>
      ) : (
        <CreateFieldMapDrawer
          title="Add Field Map"
          onSuccess={({ standard, source }) => {
            setSelectedFieldMap({
              map_source: source ?? null,
              map_standard: standard,
            });
          }}
        />
      )}
    </div>
  );
};
