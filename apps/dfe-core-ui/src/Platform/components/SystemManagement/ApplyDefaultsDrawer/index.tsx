import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Button } from 'antd';
import { useState } from 'react';
import { ApplyDefaultsContent } from './ApplyDefaultsContent';

export const ApplyDefaultsDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.system_write}>
        <RbacProtected.Unrestricted>
          <Button size="small" onClick={() => setIsOpen(true)}>
            Apply Defaults
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{
            show: true,
          }}
        >
          <Button size="small" disabled>
            Apply Defaults
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>
      <Drawer
        title="Apply Defaults"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        size="80%"
      >
        <ApplyDefaultsContent />
      </Drawer>
    </>
  );
};
