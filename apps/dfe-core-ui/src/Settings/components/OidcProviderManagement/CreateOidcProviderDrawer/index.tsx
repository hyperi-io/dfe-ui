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

// Your organisation's providers and a customer's open from separate buttons, so neither is picked by mistake.
const LABELS = {
  customer: {
    opener: 'Configure Customer OIDC Provider',
    title: 'Create Customer OIDC Provider',
  },
  yours: {
    opener: 'Configure New OIDC Provider',
    title: 'Create OIDC Provider',
  },
};

export const CreateOidcProviderDrawer = ({
  scope,
}: {
  scope: 'customer' | 'yours';
}) => {
  const labels = LABELS[scope];
  const [reauthTarget, setReauthTarget] = useState('');
  const reauth = useReauthGrant(reauthTarget, 'provider', 'create');
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const {
    mutate: createOidcProvider,
    isPending,
    error,
    reset,
  } = useCreateOidcProvider({
    reauth: reauth.grant,
    onSuccess: () => {
      reauth.drop();
      close();
      notification.success({
        title: 'OIDC provider created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  // A refusal belongs to the attempt that drew it, not to the next opening.
  function close() {
    setOpen(false);
    reset();
  }

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    const body = toCreateOidcProviderBody(values);
    setReauthTarget(body.name);
    // The engine asks for the password only when the change needs it.
    createOidcProvider(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => createOidcProvider(body))) {
          reset();
        }
      },
    });
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
            {labels.opener}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="primary" icon={<IconPlus />} disabled>
            {labels.opener}
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        size="50%"
        destroyOnHidden
        title={labels.title}
        open={open}
        onClose={close}
      >
        <OidcProviderDrawerForm
          orgScope={scope}
          isPending={isPending}
          error={error}
          onFinish={handleFinish}
        />
      </Drawer>
    </>
  );
};
