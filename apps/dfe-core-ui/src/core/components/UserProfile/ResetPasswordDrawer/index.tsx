import { Drawer } from '@/core/components/Drawer';
import { Button } from 'antd';
import { useState } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';

export const ResetPasswordDrawer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Reset Password
      </Button>
      <Drawer title="Reset Password" open={open} onClose={() => setOpen(false)}>
        <ResetPasswordForm onSuccess={() => setOpen(false)} />
      </Drawer>
    </>
  );
};
