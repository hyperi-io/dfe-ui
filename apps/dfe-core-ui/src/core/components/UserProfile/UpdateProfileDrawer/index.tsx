import { Drawer } from '@/core/components/Drawer';
import { Button } from 'antd';
import { useState } from 'react';
import { UpdateProfileForm } from './UpdateProfileForm';

export const UpdateProfileDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Update Profile
      </Button>
      <Drawer title="Update Profile" open={open} onClose={() => setOpen(false)}>
        <UpdateProfileForm onSuccess={() => setOpen(false)} />
      </Drawer>
    </>
  );
};
