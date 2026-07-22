import { NotificationCard } from '@/core/components/NotificationCard';
import { PopoverMenu } from '@/core/components/PopoverMenu';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { cn } from '@/core/utils/style';
import { useFetchGovernancePolicies } from '@/Platform/hooks/governance/useFetchGovernancePolicies';
import { Spin } from 'antd';
import { CreatePolicyDrawer } from './CreatePolicyDrawer';
import { DeletePolicyModal } from './DeletePolicyModal';
import { ViewPolicyDrawer } from './ViewPolicyDrawer';

export const Policies = () => {
  const { data: policies, isLoading, error } = useFetchGovernancePolicies();
  return (
    <SectionCard title="Policies" rightTitleSlot={<CreatePolicyDrawer />}>
      <RbacProtected action={RbacProtected.rbacActions.governance_read}>
        <RbacProtected.Unrestricted>
          {isLoading && (
            <>
              <Spin /> <span className="sr-only">Loading policies...</span>
            </>
          )}
          {error && (
            <NotificationCard
              title="Error"
              description={error.message}
              type="error"
            />
          )}
          {!isLoading && !error && policies?.length === 0 && (
            <NotificationCard
              title={
                <span className="flex items-center gap-1">
                  No policies found.
                  <CreatePolicyDrawer
                    trigger={
                      <button className="font-medium hover:underline cursor-pointer">
                        Add Policy
                      </button>
                    }
                  />
                  to get started.
                </span>
              }
            />
          )}
          {!isLoading && !error && policies && policies.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {policies.map((policy: string) => (
                <li
                  className={cn(
                    'flex items-center justify-between gap-2',
                    'bg-foreground/10 dark:bg-foreground/10 rounded-md px-3 py-1',
                  )}
                  key={policy}
                >
                  {policy}

                  <PopoverMenu
                    className="ml-4"
                    options={[
                      <ViewPolicyDrawer key={`view-${policy}`} name={policy} />,

                      <DeletePolicyModal
                        key={`delete-${policy}`}
                        policy_name={policy}
                      />,
                    ]}
                  />
                </li>
              ))}
            </ul>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
