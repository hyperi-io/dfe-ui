import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteRole } from '@/Settings/hooks/useDeleteRole';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';
import { DeleteRoleForm, DeleteRoleFormData } from './DeleteRoleForm';

interface DeleteRoleModalProps {
  role_name: string;
  onSuccess?: () => void;
  disabled?: boolean;
  refetch: () => void;
}

export const DeleteRoleModal = ({
  role_name,
  onSuccess,
  disabled,
  refetch,
}: DeleteRoleModalProps) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error } = useDeleteRole({
    onSuccess: () => {
      onSuccess?.();
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{role_name}</span> deleted
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
      refetch();
    },
  });
  const handleDeleteRole = (values: DeleteRoleFormData) => {
    mutate(values.role_name);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.role_delete}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${role_name}`}
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
            Delete Role
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true, placement: 'right' }}>
          <Button
            type="text"
            htmlType="button"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${role_name}`}
            icon={<IconTrash />}
            disabled
          >
            Delete Role
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Delete Role"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <DeleteRoleForm
          onFinish={handleDeleteRole}
          error={error}
          isPending={isPending}
          onCancel={() => setOpen(false)}
          role_name={role_name}
        />
      </Modal>
    </>
  );
};
