import { Drawer } from '@/core/components/Drawer';
import { IconEdit } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const EditRoleDrawer = ({ disabled }: { disabled?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="text"
        icon={<IconEdit />}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Edit Role
      </Button>
      <Drawer title="Edit Role" open={open} onClose={() => setOpen(false)}>
        <div className="text-error border border-error rounded-md p-4 bg-error/10">
          Implement EditRoleDrawer
        </div>
      </Drawer>
    </>
  );
};
