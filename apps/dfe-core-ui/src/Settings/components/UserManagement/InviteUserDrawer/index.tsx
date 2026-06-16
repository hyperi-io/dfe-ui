import { Drawer } from '@/core/components/Drawer';
import { IconSend } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const InviteUserDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" icon={<IconSend />} onClick={() => setOpen(true)}>
        Invite New User
      </Button>
      <Drawer title="Create User" open={open} onClose={() => setOpen(false)}>
        <div className="border border-error rounded-md p-4 text-error bg-error/10">
          Implement InviteUserDrawer
        </div>
      </Drawer>
    </>
  );
};
