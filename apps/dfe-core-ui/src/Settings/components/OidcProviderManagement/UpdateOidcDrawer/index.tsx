import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { toUpdateOidcProviderBody } from '@/core/helpers/oidcProviders.helpers';
import { useUpdateOidcProvider } from '@/core/hooks/useUpdateOidcProvider';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { OidcProviderDrawerForm } from '@/Settings/components/OidcProviderManagement/CreateUpdateOidcProviderForm';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const UpdateOidcProviderDrawer = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  const reauth = useReauthGrant(oidcProvider.name, 'provider');
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: updateOidcProvider,
    isPending,
    error,
    reset,
  } = useUpdateOidcProvider({
    reauth: reauth.grant,
    name: oidcProvider.name,
    onSuccess: (response) => {
      reauth.drop();
      api.success({
        title: (
          <>
            <span className="font-medium">{response.display_name}</span> updated
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
      close();
    },
  });

  // A refusal belongs to the attempt that drew it, not to the next opening.
  function close() {
    setOpen(false);
    reset();
  }

  const handleUpdateOidcProvider = (
    values: CreateUpdateOidcProviderFormData,
  ) => {
    const body = toUpdateOidcProviderBody(values, oidcProvider);
    // The engine asks for the password only when the change needs it.
    updateOidcProvider(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => updateOidcProvider(body))) {
          reset();
        }
      },
    });
  };
  return (
    <>
      {reauth.modal}
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

      <Drawer title="Edit OIDC Provider" open={open} onClose={close}>
        <OidcProviderDrawerForm
          orgScope="stored"
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
