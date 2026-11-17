'use client';

import { ButtonLinkSavedSearch } from '@/core/components/ButtonLinkSavedSearch';
import { RbacProtected } from '@/core/components/RbacProtected';
import { UseFetchInfiniteFilteredRulesProps } from '@/core/hooks/useFetchInfiniteFilteredRulesV2/types';
import { cn } from '@/core/utils/style';
import { CreateCustomRuleDrawer } from '@/RulesV2/components/CreateCustomRuleDrawerV2';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button } from 'antd';

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
  const { isAuthorized: canCreate } = RbacProtected.useRbac({
    action: RbacProtected.rbacActions.rule_write,
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
          {hasFilters ? 'No rules match your filters' : 'No rules found'}
        </h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {hasFilters
            ? 'Please update your filters to see rules.'
            : canCreate
              ? 'Create a rule to start building hunts from saved searches.'
              : 'No rule has been added yet.'}
        </p>
      </div>
      {hasFilters ? (
        <Button type="default" onClick={() => setFilters(defaultFilters)}>
          Clear Filters
        </Button>
      ) : (
        canCreate && (
          <>
            <ButtonLinkSavedSearch />
            <p className="text-foreground-muted dark:text-dark-foreground-muted inline-block items-center">
              Or manually insert filters and conditions:
              <CreateCustomRuleDrawer
                classNames={{
                  button: {
                    root: 'p-0.5 ml-0.5 h-6 text-foreground-muted dark:text-dark-foreground-muted ',
                  },
                }}
              />
            </p>
          </>
        )
      )}
    </div>
  );
};
