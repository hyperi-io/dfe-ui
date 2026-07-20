import { NotificationCard } from '@/core/components/NotificationCard';
import { PopoverMenu } from '@/core/components/PopoverMenu';
import { SectionCard } from '@/core/components/SectionCard';
import { cn } from '@/core/utils/style';
import { useFetchGovernanceActions } from '@/Platform/hooks/governance/useFetchGovernanceActions';
import { Spin } from 'antd';
import { CreateActionDrawer } from './CreateActionDrawer';
import { DeleteActionModal } from './DeleteActionModal';

export const Actions = () => {
  const { data: actions, isLoading, error } = useFetchGovernanceActions();
  return (
    <SectionCard title="Actions" rightTitleSlot={<CreateActionDrawer />}>
      {isLoading && (
        <>
          <Spin /> <span className="sr-only">Loading actions...</span>
        </>
      )}
      {error && (
        <NotificationCard
          title="Error"
          description={error.message}
          type="error"
        />
      )}
      {!isLoading && !error && actions?.length === 0 && (
        <NotificationCard
          title={
            <span className="flex items-center gap-1">
              No actions found.
              <CreateActionDrawer
                trigger={
                  <button className="font-medium hover:underline cursor-pointer">
                    Add Action
                  </button>
                }
              />
              to get started.
            </span>
          }
        />
      )}
      {!isLoading && !error && actions && actions.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <li
              className={cn(
                'flex items-center justify-between gap-2',
                'bg-foreground/10 dark:bg-foreground/10 rounded-md px-3 py-1',
              )}
              key={action}
            >
              {action}

              <PopoverMenu
                className="ml-4"
                options={[
                  <DeleteActionModal key={action} action_name={action} />,
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};
