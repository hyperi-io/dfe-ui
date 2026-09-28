import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useUpdateOidcProvider } from '@/core/hooks/useUpdateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { CreateUpdateOidcProviderForm } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { toUpdateOidcProviderBody } from './helpers';

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
    onSuccess: (response) => {
      api.success({
        title: (
          <>
            <span className="font-medium">{response.display_name}</span> updated
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
      setOpen(false);
    },
  });

  const handleUpdateOidcProvider = (
    values: CreateUpdateOidcProviderFormData,
  ) => {
    updateOidcProvider(toUpdateOidcProviderBody(values, oidcProvider));
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
            name: true,
            type: true,
            issuer: true,
          }}
          hasReset={true}
          buttonLabel="Update"
        />
      </Drawer>
    </>
  );
};
