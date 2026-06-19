import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ViewAccountDetails } from '@/Settings/components/AccountManagement/ViewAccountDrawer/ViewAccountDetails';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const ViewAccountDrawer = ({ username }: { username: string }) => {
  const [open, setOpen] = useState(false);
  const title = `View Account`;

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
        <ViewAccountDetails username={username} />
      </Drawer>
    </>
  );
};
