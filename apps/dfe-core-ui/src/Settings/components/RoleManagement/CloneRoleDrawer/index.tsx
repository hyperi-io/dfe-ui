import { Drawer } from '@/core/components/Drawer';
import { IconCopy } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const CloneRoleDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="text" icon={<IconCopy />} onClick={() => setOpen(true)}>
        Clone Role
      </Button>
      <Drawer title="Clone Role" open={open} onClose={() => setOpen(false)}>
        <div className="text-error border border-error rounded-md p-4 bg-error/10">
          Implement CloneRoleDrawer
        </div>
      </Drawer>
    </>
  );
};
