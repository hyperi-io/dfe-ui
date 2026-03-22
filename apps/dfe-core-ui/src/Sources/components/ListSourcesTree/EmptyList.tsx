import { UseFetchInfiniteFilteredSourcesProps } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { cn } from '@/core/utils/style';
import { CreateSourceDrawer } from '@/Sources/components/CreateSourceDrawer';
import { IconInfoCircle } from '@dfe/icons';
import { Button } from 'antd';

export const EmptyList = ({
  hasFilters,
  setFilters,
  defaultFilters,
  className,
}: {
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredSourcesProps) => void;
  defaultFilters: UseFetchInfiniteFilteredSourcesProps;
  className?: string;
}) => {
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
          {hasFilters ? 'No sources match your filters' : 'No sources found'}
        </h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {hasFilters
            ? 'Please update your filters to see sources.'
            : 'Please add a source to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="default" onClick={() => setFilters(defaultFilters)}>
          Clear Filters
        </Button>
      ) : (
        <CreateSourceDrawer />
      )}
    </div>
  );
};
