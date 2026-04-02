import { Drawer } from '@/core/components/Drawer';
import { IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const DeleteUserDrawer = ({
  title = 'Delete user',
}: {
  title?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        shape="circle"
        aria-label={title}
        type="default"
        icon={<IconTrash />}
        onClick={() => setOpen(true)}
        danger
      />
      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <div className="border border-error text-error bg-error/10 rounded-md p-4">
          Implement DeleteUserDrawer
        </div>
      </Drawer>
    </>
  );
};
