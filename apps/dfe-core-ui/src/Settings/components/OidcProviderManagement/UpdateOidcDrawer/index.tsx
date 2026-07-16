import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateUpdateOidcProviderForm } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm';
import { CreateUpdateOidcProviderFormData } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm/providers.schema';
import { TOidcProviderListItem } from '@/Settings/hooks/useFetchInfiniteFilteredOidcProviders/types';
import { useUpdateOidcProvider } from '@/Settings/hooks/useUpdateOidcProvider';
import { IconEdit } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const UpdateOidcProviderDrawer = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: updateOidcProvider,
    isPending,
    error,
  } = useUpdateOidcProvider({
    name: oidcProvider.name,
    onSuccess: () => {
      api.success({
        title: 'OIDC Provider updated successfully',
        placement: 'bottomLeft',
      });
      setOpen(false);
    },
  });

  const handleUpdateOidcProvider = (
    values: CreateUpdateOidcProviderFormData,
  ) => {
    updateOidcProvider({
      display_name: values.display_name,
    });
  };
  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.oidc_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            aria-label={`Edit ${oidcProvider.display_name}`}
            icon={<IconEdit />}
            onClick={() => setOpen(true)}
          >
            Edit OIDC Provider
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" htmlType="button" icon={<IconEdit />} disabled>
            Edit OIDC Provider
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Edit OIDC Provider"
        open={open}
        onClose={() => setOpen(false)}
      >
        <CreateUpdateOidcProviderForm
          initialValues={oidcProvider}
          onFinish={handleUpdateOidcProvider}
          error={error}
          isPending={isPending}
          disabledFields={{
            type: true,
          }}
        />
      </Drawer>
    </>
  );
};
