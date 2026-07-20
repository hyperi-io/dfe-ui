import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchGovernanceActions } from '@/Platform/hooks/governance/useFetchGovernanceActions';
import { Spin } from 'antd';
import { CreateActionDrawer } from './CreateActionDrawer';

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
        <ul>
          {actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};
