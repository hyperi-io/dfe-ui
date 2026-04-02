import { Drawer } from '@/core/components/Drawer';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const ViewOrganisationDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="text" icon={<IconEye />} onClick={() => setOpen(true)}>
        View Organisation Details
      </Button>
      <Drawer
        title="Organisation Details"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="text-error border border-error rounded-md p-4 bg-error/10">
          Implement ViewOrganisationDrawer
        </div>
      </Drawer>
    </>
  );
};
