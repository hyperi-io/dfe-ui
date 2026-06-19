import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewRoleDetails } from './ViewRoleDetails';

export const ViewRoleDetailsDrawer = ({ role_name }: { role_name: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.role_read}>
        <RbacProtected.Unrestricted>
          <Button type="text" icon={<IconEye />} onClick={() => setOpen(true)}>
            View Role Details
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" htmlType="button" icon={<IconEye />} disabled>
            View Role Details
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title="Role Details" open={open} onClose={() => setOpen(false)}>
        <ViewRoleDetails role_name={role_name} />
      </Drawer>
    </>
  );
};
