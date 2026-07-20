import { AceEditor } from '@/core/components/AceEditor';
import { Drawer } from '@/core/components/Drawer';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useInvokeGovernanceAction } from '@/Platform/hooks/governance/useInvokeGovernanceAction';

import { IconArrowUpRight, IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

const dataListTermStyle = 'text-foreground/50 dark:text-foreground/50';
const EmptyText = () => (
  <span className="text-foreground/50 dark:text-foreground/50">None</span>
);

export const InvokeActionDrawer = ({ name }: { name: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data,
    mutate: invokeGovernanceAction,
    isPending,
    error,
  } = useInvokeGovernanceAction();

  const handleInvokeGovernanceAction = () => {
    invokeGovernanceAction({ name });
    setIsOpen(true);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.governance_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            disabled={isPending}
            loading={isPending}
            onClick={handleInvokeGovernanceAction}
            icon={<IconArrowUpRight />}
          >
            Invoke Action
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'bottomRight' }}
        >
          <Button htmlType="button" type="primary" icon={<IconPlus />} disabled>
            Invoke Action
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Invoke Action"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {error && (
          <NotificationCard
            title="Error"
            description={error.message}
            type="error"
          />
        )}
        {data && (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <dt className={dataListTermStyle}>Auto Merged</dt>
              <dd>{data.auto_merged ? 'Yes' : 'No'}</dd>
              <dt className={dataListTermStyle}>Dry Run</dt>
              <dd>{data.dry_run ? 'Yes' : 'No'}</dd>
              <dt className={dataListTermStyle}>Changed</dt>
              <dd>{data.changed ? 'Yes' : 'No'}</dd>
              <dt className={dataListTermStyle}>Commit SHA</dt>
              <dd>{data.commit_sha || <EmptyText />}</dd>
              <dt className={dataListTermStyle}>Review Required</dt>
              <dd>{data.review_required ? 'Yes' : 'No'}</dd>
              <dt className={dataListTermStyle}>PR URL</dt>
              <dd>{data.pr_url || <EmptyText />}</dd>
            </dl>

            {data.diff && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Diff</p>
                <AceEditor
                  value={JSON.stringify(data.diff, null, 2)}
                  name="diff"
                  mode="json"
                  readOnly
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
};
