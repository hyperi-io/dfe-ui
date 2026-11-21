import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteOidcProvider } from '@/Settings/hooks/oidcProviders/useDeleteOidcProvider';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';
import {
  DeleteOidcProviderForm,
  DeleteOidcProviderFormData,
} from './DeleteOidcProviderForm';

interface DeleteOidcProviderModalProps {
  oidcProviderName: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export const DeleteOidcProviderModal = ({
  oidcProviderName,
  onSuccess,
  disabled,
}: DeleteOidcProviderModalProps) => {
  const reauth = useReauthGrant(oidcProviderName, 'provider');
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error } = useDeleteOidcProvider({
    reauth: reauth.grant,
    onSuccess: () => {
      reauth.drop();
      onSuccess?.();
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{oidcProviderName}</span> deleted
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
    },
  });
  const handleDeleteOidcProvider = (values: DeleteOidcProviderFormData) => {
    mutate(values.oidcProviderName);
  };

  return (
    <>
      {reauth.modal}
      <RbacProtected action={RbacProtected.rbacActions.oidc_delete}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${oidcProviderName}`}
            icon={<IconTrash />}
            onClick={() => reauth.ask(() => setOpen(true))}
            disabled={disabled}
          >
            Delete OIDC Provider
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${oidcProviderName}`}
            icon={<IconTrash />}
            onClick={() => reauth.ask(() => setOpen(true))}
            disabled
          >
            Delete OIDC Provider
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Delete OIDC Provider"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <DeleteOidcProviderForm
          onFinish={handleDeleteOidcProvider}
          error={error}
          isPending={isPending}
          onCancel={() => setOpen(false)}
          oidcProviderName={oidcProviderName}
        />
      </Modal>
    </>
  );
};
