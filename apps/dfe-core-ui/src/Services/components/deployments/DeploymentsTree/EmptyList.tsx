import { UseFetchInfiniteFilteredDeploymentsProps } from '@/Services/hooks/deployments/useFetchInfiniteFilteredDeployments/types';
import { cn } from '@/core/utils/style';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button } from 'antd';

export const EmptyList = ({
  hasFilters,
  setFilters,
  defaultFilters,
  className,
}: {
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredDeploymentsProps) => void;
  defaultFilters: UseFetchInfiniteFilteredDeploymentsProps;
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
          {hasFilters
            ? 'No deployments match your filters'
            : 'No deployments found'}
        </h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {hasFilters
            ? 'Please update your filters to see deployments.'
            : 'Please review the deployments list to see all available deployments.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="default" onClick={() => setFilters(defaultFilters)}>
          Clear Filters
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
