import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteOidcProvider } from '@/Settings/hooks/oidcProviders/useDeleteOidcProvider';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useRef, useState } from 'react';
import { DeleteOidcProviderForm } from './DeleteOidcProviderForm';

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
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  // Every delete asks for the password again.
  const grant = useRef<string>(undefined);
  const { mutate, isPending, error, reset } = useDeleteOidcProvider({
    reauth: () => grant.current,
    onSuccess: () => {
      grant.current = undefined;
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

  const close = () => {
    reset();
    setOpen(false);
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
        title={`Delete ${oidcProviderName}?`}
        open={open}
        onCancel={close}
        footer={null}
        destroyOnHidden
      >
        <DeleteOidcProviderForm
          onConfirm={(granted) => {
            grant.current = granted;
            mutate(oidcProviderName);
          }}
          error={error}
          isPending={isPending}
          onCancel={close}
          oidcProviderName={oidcProviderName}
        />
      </Modal>
    </>
  );
};
