import { useDeleteOrganisation } from '@/Settings/hooks/organisations/useDeleteOrganisation';

import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';
import {
  DeleteOrganisationForm,
  DeleteOrganisationFormData,
} from './DeleteOrganisationForm';

interface DeleteOrganisationModalProps {
  org_name: string;
  display_name: string;
  onSuccess?: () => void;
  disabledReason?: string;
}

export const DeleteOrganisationModal = ({
  org_name,
  display_name,
  onSuccess,
  disabledReason,
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
    },
  });
  const handleDeleteOrganisation = (values: DeleteOrganisationFormData) => {
    mutate(values.org_name);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.org_delete}>
        <RbacProtected.Unrestricted>
          <Tooltip title={disabledReason}>
            <Button
              type="text"
              className="hover:text-error hover:bg-error/5"
              aria-label={`Delete ${display_name}`}
              icon={<IconTrash />}
              onClick={() => setOpen(true)}
              disabled={!!disabledReason}
            >
              Delete Organisation
            </Button>
          </Tooltip>
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
