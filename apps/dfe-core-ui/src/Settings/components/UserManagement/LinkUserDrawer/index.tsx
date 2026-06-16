import { Drawer } from '@/core/components/Drawer';
import { IconLinkPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const LinkUserDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="primary"
        icon={<IconLinkPlus />}
        onClick={() => setOpen(true)}
      >
        Link New User
      </Button>
      <Drawer title="Link User" open={open} onClose={() => setOpen(false)}>
        <div className="border border-error rounded-md p-4 text-error bg-error/10">
          Implement LinkUserDrawer
        </div>
      </Drawer>
    </>
  );
};
