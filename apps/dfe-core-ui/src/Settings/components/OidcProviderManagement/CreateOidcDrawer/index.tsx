import { CreateUpdateOidcForm } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcForm';
import { CreateUpdateOidcSchema } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcForm/providers.schema';
import { useCreateOidcProvider } from '@/Settings/hooks/useCreateOidcProvider';
import { IconSettings2 } from '@repo/dfe-icons';
import { App, Button, Drawer } from 'antd';
import { useState } from 'react';

export const CreateOidcDrawer = ({
  title,
  initialValues,
}: {
  title: string;
  initialValues: CreateUpdateOidcSchema;
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
        message: 'OIDC provider created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleFinish = (values: CreateUpdateOidcSchema) => {
    createOidcProvider(values);
  };

  return (
    <>
      <Button
        type="text"
        icon={<IconSettings2 />}
        onClick={() => setOpen(true)}
      >
        {title}
      </Button>
      <Drawer
        size="50%"
        destroyOnHidden
        title={title}
        open={open}
        onClose={onClose}
      >
        <CreateUpdateOidcForm
          initialValues={initialValues}
          isPending={isPending}
          error={error}
          onFinish={handleFinish}
        />
      </Drawer>
    </>
  );
};
