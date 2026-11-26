import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteRole } from '@/Settings/hooks/roles/useDeleteRole';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useRef, useState } from 'react';
import { DeleteRoleForm } from './DeleteRoleForm';

interface DeleteRoleModalProps {
  role_name: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export const DeleteRoleModal = ({
  role_name,
  onSuccess,
  disabled,
}: DeleteRoleModalProps) => {
  const grant = useRef<string>(undefined);
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error, reset } = useDeleteRole({
    reauth: () => grant.current,
    onSuccess: () => {
      grant.current = undefined;
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
    },
  });
  const close = () => {
    reset();
    setOpen(false);
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
        <RbacProtected.Restricted tooltip={{ show: true }}>
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
        title={`Delete ${role_name}?`}
        open={open}
        destroyOnHidden
        onCancel={close}
        footer={null}
      >
        <DeleteRoleForm
          onConfirm={(granted) => {
            grant.current = granted;
            mutate(role_name);
          }}
          error={error}
          isPending={isPending}
          onCancel={close}
          role_name={role_name}
        />
      </Modal>
    </>
  );
};
