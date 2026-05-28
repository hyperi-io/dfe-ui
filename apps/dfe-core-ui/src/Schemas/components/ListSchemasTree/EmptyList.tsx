import { UseFetchInfiniteFilteredSchemasProps } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { cn } from '@/core/utils/style';
import { CreateSchemaDrawer } from '@/Schemas/components/CreateSchemaDrawer';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button } from 'antd';

export const EmptyList = ({
  hasFilters,
  setFilters,
  defaultFilters,
  className,
}: {
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredSchemasProps) => void;
  defaultFilters: UseFetchInfiniteFilteredSchemasProps;
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
          {hasFilters ? 'No schemas match your filters' : 'No schemas found'}
        </h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {hasFilters
            ? 'Please update your filters to see schemas.'
            : 'Please add a schema to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="default" onClick={() => setFilters(defaultFilters)}>
          Clear Filters
        </Button>
      ) : (
        <CreateSchemaDrawer />
      )}
    </div>
  );
};
