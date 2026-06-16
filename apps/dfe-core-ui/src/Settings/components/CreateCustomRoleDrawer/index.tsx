import { Drawer } from '@/core/components/Drawer';
import { IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { CreateRoleForm } from './CreateRoleForm';

export const CreateCustomRoleDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        type="primary"
        onClick={() => setIsOpen(true)}
        icon={<IconPlus />}
      >
        Configure New Custom Role
      </Button>
      <Drawer
        title="Create Custom Role"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <CreateRoleForm />
      </Drawer>
    </>
  );
};
