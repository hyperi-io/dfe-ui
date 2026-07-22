import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';

import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewHelmFileDetail } from './ViewHelmFileDetail';

export const ViewHelmFileDrawer = ({ name }: { name: string }) => {
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
            View Helm File
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'bottomRight' }}
        >
          <Button htmlType="button" type="primary" icon={<IconEye />} disabled>
            View Helm File
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="View Helm File"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ViewHelmFileDetail name={name} />
      </Drawer>
    </>
  );
};
