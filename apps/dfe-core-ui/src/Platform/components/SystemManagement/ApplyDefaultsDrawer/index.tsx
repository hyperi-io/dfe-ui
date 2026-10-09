import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IdentifyConfigDriftTabs } from '@/Platform/components/SystemManagement//IdentifyConfigDriftTabs';
import { Button } from 'antd';
import { useState } from 'react';

export const ApplyDefaultsDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.system_write}>
        <RbacProtected.Unrestricted>
          <Button size="small" onClick={() => setIsOpen(true)}>
            Identify Config Drift
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{
            show: true,
          }}
        >
          <Button size="small" disabled>
            Identify Config Drift
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>
      <Drawer
        title="Identify Config Drift"
        open={isOpen}
        classNames={{
          body: 'pt-2',
        }}
        onClose={() => setIsOpen(false)}
        size="80%"
      >
        <IdentifyConfigDriftTabs />
      </Drawer>
    </>
  );
};
