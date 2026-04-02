import { Drawer } from '@/core/components/Drawer';
import { IconEdit } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const EditOrganisationDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="text" icon={<IconEdit />} onClick={() => setOpen(true)}>
        Edit Organisation
      </Button>
      <Drawer
        title="Edit Organisation"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="text-error border border-error rounded-md p-4 bg-error/10">
          Implement EditOrganisationDrawer
        </div>
      </Drawer>
    </>
  );
};
