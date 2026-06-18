import { useDeleteOrganisation } from '@/Settings/hooks/useDeleteOrganisation';

import { IconTrash } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';
import {
  DeleteOrganisationForm,
  DeleteOrganisationFormData,
} from './DeleteOrganisationForm';

interface DeleteOrganisationModalProps {
  org_name: string;
  display_name: string;
  onSuccess?: () => void;
  disabled?: boolean;
  refetch: () => void;
}

export const DeleteOrganisationModal = ({
  org_name,
  display_name,
  onSuccess,
  disabled,
  refetch,
}: DeleteOrganisationModalProps) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error } = useDeleteOrganisation({
    onSuccess: () => {
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
      refetch();
    },
  });
  const handleDeleteOrganisation = (values: DeleteOrganisationFormData) => {
    mutate(values.org_name);
  };

  return (
    <>
      <Button
        type="text"
        className="hover:text-error hover:bg-error/5"
        aria-label={`Delete ${display_name}`}
        icon={<IconTrash />}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Delete Organisation
      </Button>

      <Modal
        title="Delete Organisation"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <DeleteOrganisationForm
          onFinish={handleDeleteOrganisation}
          error={error}
          isPending={isPending}
          onCancel={() => setOpen(false)}
          org_name={org_name}
        />
      </Modal>
    </>
  );
};
