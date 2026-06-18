import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateOrganisationForm,
  CreateUpdateOrganisationFormData,
} from '@/Settings/components/OrganisationManagement/CreateUpdateOrganisationForm';
import { useCreateOrganisation } from '@/Settings/hooks/useCreateOrganisation';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateOrganisationDrawer = ({
  refetch,
}: {
  refetch: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: createOrganisation,
    isPending,
    error,
  } = useCreateOrganisation({
    onSuccess: () => {
      api.success({
        title: 'Organisation created successfully',
        placement: 'bottomLeft',
      });
      refetch();
      setIsOpen(false);
    },
  });

  const handleCreateOrganisation = (
    values: CreateUpdateOrganisationFormData,
  ) => {
    createOrganisation(values);
  };
  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.org_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => setIsOpen(true)}
          >
            Configure New Organisation
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <Button disabled type="primary" icon={<IconPlus />}>
            Configure New Organisation
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Create Organisation"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <CreateUpdateOrganisationForm
          initialValues={{
            dedicated_database: false,
            display_name: '',
            org_ids: [],
            name: '',
          }}
          onFinish={handleCreateOrganisation}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
