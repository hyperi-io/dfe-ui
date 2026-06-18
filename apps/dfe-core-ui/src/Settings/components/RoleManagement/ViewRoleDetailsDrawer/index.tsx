import { Drawer } from '@/core/components/Drawer';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewRoleDetails } from './ViewRoleDetails';

export const ViewRoleDetailsDrawer = ({ role_name }: { role_name: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="text" icon={<IconEye />} onClick={() => setOpen(true)}>
        View Role Details
      </Button>
      <Drawer title="Role Details" open={open} onClose={() => setOpen(false)}>
        <ViewRoleDetails role_name={role_name} />
      </Drawer>
    </>
  );
};
