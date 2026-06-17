import { Drawer } from '@/core/components/Drawer';
import {
  CreateUpdateOrganisationForm,
  CreateUpdateOrganisationFormData,
} from '@/Settings/components/OrganisationManagement/CreateUpdateOrganisationForm';
import { useCreateOrganisation } from '@/Settings/hooks/useCreateOrganisation';
import { IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const CreateOrganisationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    mutate: createOrganisation,
    isPending,
    error,
  } = useCreateOrganisation();

  const handleCreateOrganisation = (
    values: CreateUpdateOrganisationFormData,
  ) => {
    createOrganisation(values);
  };
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
        <CreateUpdateOrganisationForm
          initialValues={{ dedicated_database: false }}
          onFinish={handleCreateOrganisation}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
