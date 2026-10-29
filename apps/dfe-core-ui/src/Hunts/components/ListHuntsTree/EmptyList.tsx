import { CreateHuntDrawer } from '@/Hunts/components/CreateHuntDrawer';
import { UseFetchInfiniteFilteredHuntsProps } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { RbacProtected } from '@/core/components/RbacProtected';
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
  setFilters: (filters: UseFetchInfiniteFilteredHuntsProps) => void;
  defaultFilters: UseFetchInfiniteFilteredHuntsProps;
  className?: string;
}) => {
  const { isAuthorized: canCreate } = RbacProtected.useRbac({
    action: RbacProtected.rbacActions.hunt_write,
  });
  return (
    <div
      className={cn(
        'bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex flex-col items-center gap-2 text-center',
        className,
      )}
    >
      <IconInfoCircle className="w-6 h-6 text-foreground" />
      <div className="flex flex-col">
        <h2 className="font-medium text-md">
          {hasFilters ? 'No hunts match your filters' : 'No hunts found'}
        </h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {hasFilters
            ? 'Please update your filters to see hunts.'
            : canCreate
              ? 'Create a hunt to start building hunts from saved searches.'
              : 'No hunt has been added yet.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="default" onClick={() => setFilters(defaultFilters)}>
          Clear Filters
        </Button>
      ) : (
        <CreateHuntDrawer />
      )}
    </div>
  );
};
