import { Drawer } from '@/core/components/Drawer';
import { ViewUserDetails } from '@/Settings/components/UserManagement/ViewUserDrawer/ViewUserDetails';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const ViewUserDrawer = ({ username }: { username: string }) => {
  const [open, setOpen] = useState(false);
  const title = `View ${username}`;

  return (
    <>
      <Button
        aria-label={title}
        type="text"
        icon={<IconEye />}
        onClick={() => setOpen(true)}
      >
        View User
      </Button>
      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <ViewUserDetails username={username} />
      </Drawer>
    </>
  );
};
