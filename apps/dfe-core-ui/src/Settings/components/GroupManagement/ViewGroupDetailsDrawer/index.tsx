import { Drawer } from '@/core/components/Drawer';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { ViewGroupDetails } from './ViewGroupDetails';

export const ViewGroupDetailsDrawer = ({
  group_name,
}: {
  group_name: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="text" icon={<IconEye />} onClick={() => setOpen(true)}>
        View Group Details
      </Button>
      <Drawer title="Group Details" open={open} onClose={() => setOpen(false)}>
        <ViewGroupDetails group_name={group_name} />
      </Drawer>
    </>
  );
};
