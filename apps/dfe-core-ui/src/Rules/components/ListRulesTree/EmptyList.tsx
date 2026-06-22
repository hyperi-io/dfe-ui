import { UseFetchInfiniteFilteredRulesProps } from '@/Rules/hooks/useFetchInfiniteFilteredRules/types';
import { cn } from '@/core/utils/style';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button } from 'antd';
import Link from 'next/link';

export const EmptyList = ({
  hasFilters,
  setFilters,
  defaultFilters,
  className,
}: {
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredRulesProps) => void;
  defaultFilters: UseFetchInfiniteFilteredRulesProps;
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
          {hasFilters ? 'No rules match your filters' : 'No rules found'}
        </h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {hasFilters
            ? 'Please update your filters to see rules.'
            : 'Create a rule to start building hunts from saved searches.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="default" onClick={() => setFilters(defaultFilters)}>
          Clear Filters
        </Button>
      ) : (
        <Link href="/rules/create">
          <Button type="primary">Create Rule</Button>
        </Link>
      )}
    </div>
  );
};
