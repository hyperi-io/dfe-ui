import { Drawer } from '@/core/components/Drawer';
import { IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { CreateOrganisationForm } from './CreateOrganisationForm';

export const CreateOrganisationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        type="primary"
        icon={<IconPlus />}
        onClick={() => setIsOpen(true)}
      >
        Configure New Organisation
      </Button>
      <Drawer
        title="Create Organisation"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <CreateOrganisationForm />
      </Drawer>
    </>
  );
};
