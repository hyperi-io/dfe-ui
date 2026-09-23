import { Drawer } from '@/core/components/Drawer';
import { Tooltip } from '@/core/components/Tooltip';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { Button } from 'antd';
import { useState } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';

export const ResetPasswordDrawer = () => {
  const [open, setOpen] = useState(false);
  const {
    data: { external: externalUser } = {},
    isLoading,
    error,
  } = useFetchCurrentUser();

  return (
    <>
      {!isLoading && !error ? (
        <>
          {externalUser && (
            <Tooltip title="External users cannot reset their password">
              <Button type="primary" disabled={externalUser}>
                Reset Password
              </Button>
            </Tooltip>
          )}
          {!externalUser && (
            <Button type="primary" onClick={() => setOpen(true)}>
              Reset Password
            </Button>
          )}
        </>
      ) : (
        <Button type="primary" loading={true} disabled={true}>
          Reset Password
        </Button>
      )}

      <Drawer title="Reset Password" open={open} onClose={() => setOpen(false)}>
        <ResetPasswordForm onSuccess={() => setOpen(false)} />
      </Drawer>
    </>
  );
};
