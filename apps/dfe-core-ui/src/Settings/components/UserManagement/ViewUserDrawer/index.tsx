import { Drawer } from '@/core/components/Drawer';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const ViewUserDrawer = ({ title = 'View User' }: { title?: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        aria-label={title}
        type="text"
        icon={<IconEye />}
        onClick={() => setOpen(true)}
      >
        {title}
      </Button>
      <Drawer title={title} open={open} onClose={() => setOpen(false)}>
        <div className="border border-error text-error bg-error/10 rounded-md p-4">
          Implement ViewUserDrawer
        </div>
      </Drawer>
    </>
  );
};
