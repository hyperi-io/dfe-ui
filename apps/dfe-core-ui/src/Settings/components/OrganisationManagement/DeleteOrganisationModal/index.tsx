import { useDeleteOrganisation } from '@/Settings/hooks/organisations/useDeleteOrganisation';

import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useRef, useState } from 'react';
import { DeleteOrganisationForm } from './DeleteOrganisationForm';

interface DeleteOrganisationModalProps {
  org_name: string;
  display_name: string;
  onSuccess?: () => void;
}

export const DeleteOrganisationModal = ({
  org_name,
  display_name,
  onSuccess,
}: DeleteOrganisationModalProps) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  // Deleting takes the org's accounts, keys and providers with it, so it asks for the password.
  const grant = useRef<string>(undefined);
  const { mutate, isPending, error, reset } = useDeleteOrganisation({
    reauth: () => grant.current,
    onSuccess: () => {
      grant.current = undefined;
      onSuccess?.();
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{display_name}</span> deleted
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
      <RbacProtected action={RbacProtected.rbacActions.org_delete}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${display_name}`}
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
          >
            Delete Organisation
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${display_name}`}
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
            disabled
          >
            Delete Organisation
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${display_name}?`}
        open={open}
        destroyOnHidden
        onCancel={close}
        footer={null}
      >
        <DeleteOrganisationForm
          onConfirm={(granted) => {
            grant.current = granted;
            mutate(org_name);
          }}
          error={error}
          isPending={isPending}
          onCancel={close}
          org_name={org_name}
        />
      </Modal>
    </>
  );
};
