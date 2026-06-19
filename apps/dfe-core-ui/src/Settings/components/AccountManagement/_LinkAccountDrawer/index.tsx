import { Drawer } from '@/core/components/Drawer';
import { IconLinkPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const LinkAccountDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="primary"
        icon={<IconLinkPlus />}
        onClick={() => setOpen(true)}
      >
        Link New Account
      </Button>
      <Drawer title="Link Account" open={open} onClose={() => setOpen(false)}>
        <div className="border border-error rounded-md p-4 text-error bg-error/10">
          Implement LinkAccountDrawer
        </div>
      </Drawer>
    </>
  );
};
