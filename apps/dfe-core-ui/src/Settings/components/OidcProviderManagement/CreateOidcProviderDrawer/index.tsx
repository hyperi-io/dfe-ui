import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { toCreateOidcProviderBody } from '@/core/helpers/oidcProviders.helpers';
import { useCreateOidcProvider } from '@/core/hooks/useCreateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { OidcProviderDrawerForm } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm';
import { IconPlus } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const CreateOidcProviderDrawer = ({ title }: { title: string }) => {
  const [reauthTarget, setReauthTarget] = useState('');
  const reauth = useReauthGrant(reauthTarget, 'provider', 'create');
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  const { notification } = App.useApp();

  const {
    mutate: createOidcProvider,
    isPending,
    error,
  } = useCreateOidcProvider({
    reauth: reauth.grant,
    onSuccess: () => {
      reauth.drop();
      onClose();
      notification.success({
        title: 'OIDC provider created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    setReauthTarget(toCreateOidcProviderBody(values).name);
    reauth.ask(() => createOidcProvider(toCreateOidcProviderBody(values)));
  };

  return (
    <>
      {reauth.modal}
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
        <OidcProviderDrawerForm
          isPending={isPending}
          error={error}
          onFinish={handleFinish}
        />
      </Drawer>
    </>
  );
};
