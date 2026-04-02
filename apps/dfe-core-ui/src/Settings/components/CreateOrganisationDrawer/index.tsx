import { IconPlus } from '@repo/dfe-icons';
import { Button, Drawer } from 'antd';
import { useState } from 'react';
import { CreateOrganisationForm } from './CreateOrganisationForm';

export const CreateOrganisationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button type="primary" icon={<IconPlus />}>
        Create Organisation
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
