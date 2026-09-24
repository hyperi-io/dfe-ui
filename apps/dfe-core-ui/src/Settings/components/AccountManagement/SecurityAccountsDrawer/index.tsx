import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconLock } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { SecurityAccountsDetails } from './SecurityAccountsDetails';

export const SecurityAccountsDrawer = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.account_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            icon={<IconLock />}
            onClick={() => setOpen(true)}
          >
            Manage Security Accounts
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'bottomRight' }}
        >
          <Button
            type="primary"
            icon={<IconLock />}
            disabled
            onClick={() => setOpen(true)}
          >
            Manage Security Accounts
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Manage Security Accounts"
        open={open}
        onClose={() => setOpen(false)}
      >
        <SecurityAccountsDetails />
      </Drawer>
    </>
  );
};
