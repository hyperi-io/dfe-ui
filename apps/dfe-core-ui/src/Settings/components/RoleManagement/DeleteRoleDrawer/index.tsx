import { Drawer } from '@/core/components/Drawer';
import { IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const DeleteRoleDrawer = ({ disabled }: { disabled?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="text"
        icon={<IconTrash />}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Delete Role
      </Button>
      <Drawer title="Delete Role" open={open} onClose={() => setOpen(false)}>
        <div className="text-error border border-error rounded-md p-4 bg-error/10">
          Implement DeleteRoleDrawer
        </div>
      </Drawer>
    </>
  );
};
