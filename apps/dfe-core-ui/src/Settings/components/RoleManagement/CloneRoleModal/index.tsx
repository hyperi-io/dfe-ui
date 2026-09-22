import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateUpdateRoleFormData } from '@/Settings/components/RoleManagement/CreateUpdateRoleForm';
import { useCreateRole } from '@/Settings/hooks/roles/useCreateRole';
import { IconCopy } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';
import { CloneRoleForm } from './CloneRoleForm';

export const CloneRoleModal = ({
  role_name,
  refetch,
}: {
  role_name: string;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const { notification } = App.useApp();

  const { mutate, isPending, error } = useCreateRole({
    onSuccess: () => {
      refetch();
      notification.success({
        title: `Role ${role_name} cloned successfully`,
        placement: 'bottomLeft',
      });
      setOpen(false);
    },
  });

  const handleCloneRole = (values: CreateUpdateRoleFormData) => {
    mutate(values);
  };
  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.role_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            aria-label={`Clone ${role_name}`}
            icon={<IconCopy />}
            onClick={() => setOpen(true)}
          >
            Clone Role
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            htmlType="button"
            type="text"
            aria-label={`Clone ${role_name}`}
            icon={<IconCopy />}
            disabled
          >
            Clone Role
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Clone Role"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <CloneRoleForm
          name={`clone-role-form-${role_name}`}
          onFinish={handleCloneRole}
          error={error}
          isPending={isPending}
          role_name={role_name}
        />
      </Modal>
    </>
  );
};
