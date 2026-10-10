import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { toScopesRequest } from '@/core/helpers/oidcProviders.helpers';
import { useCreateOidcProvider } from '@/core/hooks/useCreateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { CreateUpdateOidcProviderForm } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm';
import { IconPlus } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const CreateOidcProviderDrawer = ({ title }: { title: string }) => {
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

  const handleFinish = ({
    scopes,
    ...values
  }: CreateUpdateOidcProviderFormData) => {
    createOidcProvider({ ...values, ...toScopesRequest(scopes) });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.oidc_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => setOpen(true)}
          >
            {title}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="primary" icon={<IconPlus />} disabled>
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
          isPending={isPending}
          error={error}
          onFinish={handleFinish}
        />
      </Drawer>
    </>
  );
};
