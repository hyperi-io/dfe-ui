import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';

import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewPolicyDetail } from './ViewPolicyDetail';

export const ViewPolicyDrawer = ({ name }: { name: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.governance_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            onClick={() => setIsOpen(true)}
            icon={<IconEye />}
          >
            View Policy
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'bottomRight' }}
        >
          <Button type="text" disabled icon={<IconEye />}>
            View Policy
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="View Policy"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ViewPolicyDetail name={name} />
      </Drawer>
    </>
  );
};
