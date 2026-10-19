import { Drawer } from '@/core/components/Drawer';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IdentifyConfigDriftTabs } from '@/Platform/components/SystemManagement//IdentifyConfigDriftTabs';
import { IconScan } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

const pendingDeployWarning = (count: number) =>
  count === 1
    ? 'There is 1 pending deploy. These configuration updates have not been deployed.'
    : `There are ${count} pending deploys. These configuration updates have not been deployed.`;

export const IdentifyConfigDriftMenuButton = ({
  onClick,
}: {
  onClick: () => void;
}) => (
  <RbacProtected action={RbacProtected.rbacActions.system_write}>
    <RbacProtected.Unrestricted>
      <Button type="text" icon={<IconScan />} size="small" onClick={onClick}>
        Identify Config Drift
      </Button>
    </RbacProtected.Unrestricted>
    <RbacProtected.Restricted tooltip={{ show: true }}>
      <Button type="text" icon={<IconScan />} size="small" disabled>
        Identify Config Drift
      </Button>
    </RbacProtected.Restricted>
  </RbacProtected>
);

export const IdentifyConfigDriftDrawer = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [pendingDeployCount, setPendingDeployCount] = useState(0);

  const handleSuccess = () => {
    setPendingDeployCount(0);
    onClose();
  };

  return (
    <Drawer
      title="Identify Config Drift"
      open={open}
      onClose={onClose}
      size="80%"
      preventClickaway={
        pendingDeployCount > 0
          ? {
              enabled: true,
              explicit: true,
              title: 'Pending deploys',
              message: (
                <div className="flex flex-col gap-2">
                  <span>{pendingDeployWarning(pendingDeployCount)}</span>
                  <NotificationCard
                    description="If you close this drawer you will need to manually redeploy each affected source from the sources view."
                    type="warning"
                  />
                </div>
              ),
              confirmLabel: 'Close',
              cancelLabel: 'Keep open',
            }
          : { enabled: false }
      }
    >
      <IdentifyConfigDriftTabs
        onSuccess={handleSuccess}
        onPendingDeployCountChange={setPendingDeployCount}
      />
    </Drawer>
  );
};
