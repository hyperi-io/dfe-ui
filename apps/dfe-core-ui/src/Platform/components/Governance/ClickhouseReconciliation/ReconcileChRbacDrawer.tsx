import { AceEditor } from '@/core/components/AceEditor';
import { Drawer } from '@/core/components/Drawer';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useReconcileGovernanceChRbac } from '@/Platform/hooks/governance/useReconcileGovernanceChRbac';
import { Button, Spin } from 'antd';
import { useState } from 'react';

export const ReconcileChRbacDrawer = () => {
  const [open, setOpen] = useState(false);
  const {
    data,
    mutate: reconcileChRbac,
    isPending,
    error,
  } = useReconcileGovernanceChRbac();

  const handleReconcileChRbac = () => {
    setOpen(true);
    reconcileChRbac();
  };
  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.governance_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            onClick={handleReconcileChRbac}
            loading={isPending}
          >
            Reconcile
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="primary" disabled>
            Reconcile
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Reconcile Clickhouse RBAC"
        open={open}
        onClose={() => setOpen(false)}
        footer={null}
      >
        {isPending && (
          <>
            <Spin />{' '}
            <span className="sr-only">Reconciling Clickhouse RBAC...</span>
          </>
        )}
        {error && (
          <NotificationCard
            title="Error"
            description={error.message}
            type="error"
          />
        )}

        {data && (
          <AceEditor
            value={JSON.stringify(data, null, 2)}
            mode="json"
            readOnly
            height="100%"
          />
        )}
      </Drawer>
    </>
  );
};
