import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteOidcProvider } from '@/Settings/hooks/useDeleteOidcProvider';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';
import {
  DeleteOidcProviderForm,
  DeleteOidcProviderFormData,
} from './DeleteOidcProviderForm';

interface DeleteOidcProviderModalProps {
  oidcProviderName: string;
  onSuccess?: () => void;
  disabled?: boolean;
  refetch: () => void;
}

export const DeleteOidcProviderModal = ({
  oidcProviderName,
  onSuccess,
  disabled,
  refetch,
}: DeleteOidcProviderModalProps) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error } = useDeleteOidcProvider({
    onSuccess: () => {
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
      refetch();
    },
  });
  const handleDeleteOidcProvider = (values: DeleteOidcProviderFormData) => {
    mutate(values.oidcProviderName);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.oidc_delete}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${oidcProviderName}`}
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
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
            onClick={() => setOpen(true)}
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
