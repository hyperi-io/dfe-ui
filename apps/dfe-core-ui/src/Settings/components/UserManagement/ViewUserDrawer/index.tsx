import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ViewUserDetails } from '@/Settings/components/UserManagement/ViewUserDrawer/ViewUserDetails';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const ViewUserDrawer = ({ username }: { username: string }) => {
  const [open, setOpen] = useState(false);
  const title = `View User`;

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.account_read}>
        <RbacProtected.Unrestricted>
          <Button
            aria-label={title}
            type="text"
            icon={<IconEye />}
            onClick={() => setOpen(true)}
          >
            {title}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <Button
            aria-label={title}
            type="text"
            disabled
            icon={<IconEye />}
            onClick={() => setOpen(true)}
          >
            {title}
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <ViewUserDetails username={username} />
      </Drawer>
    </>
  );
};
