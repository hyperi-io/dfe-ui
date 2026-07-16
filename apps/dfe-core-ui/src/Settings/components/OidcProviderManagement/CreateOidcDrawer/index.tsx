import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateUpdateOidcProviderForm } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm';
import { CreateUpdateOidcProviderFormData } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm/providers.schema';
import { useCreateOidcProvider } from '@/Settings/hooks/useCreateOidcProvider';
import { IconSettings2 } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const CreateOidcDrawer = ({
  title,
  initialValues,
}: {
  title: string;
  initialValues: CreateUpdateOidcProviderFormData;
}) => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  const { notification } = App.useApp();

  const {
    mutate: createOidcProvider,
    isPending,
    error,
  } = useCreateOidcProvider({
    onSuccess: () => {
      onClose();
      notification.success({
        title: 'OIDC provider created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    createOidcProvider(values);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.oidc_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            icon={<IconSettings2 />}
            onClick={() => setOpen(true)}
          >
            {title}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" icon={<IconSettings2 />} disabled>
            {title}
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        size="50%"
        destroyOnHidden
        title={title}
        open={open}
        onClose={onClose}
      >
        <CreateUpdateOidcProviderForm
          initialValues={initialValues}
          isPending={isPending}
          error={error}
          onFinish={handleFinish}
        />
      </Drawer>
    </>
  );
};
