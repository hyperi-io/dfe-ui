import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewGroupDetails } from './ViewGroupDetails';

export const ViewGroupDetailsDrawer = ({
  group_name,
}: {
  group_name: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.group_read}>
        <RbacProtected.Unrestricted>
          <Button type="text" icon={<IconEye />} onClick={() => setOpen(true)}>
            View Group Details
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            disabled
            type="text"
            icon={<IconEye />}
            onClick={() => setOpen(true)}
          >
            View Group Details
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title="Group Details" open={open} onClose={() => setOpen(false)}>
        <ViewGroupDetails group_name={group_name} />
      </Drawer>
    </>
  );
};
