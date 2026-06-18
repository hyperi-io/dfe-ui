import { Drawer } from '@/core/components/Drawer';
import { useUpdateRole } from '@/Settings/hooks/useUpdateRole';
import { IconEdit } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { UpdateRoleForm, UpdateRoleFormData } from './UpdateRoleForm';

export const EditRoleDrawer = ({
  disabled,
  role_name,
  refetch,
}: {
  disabled?: boolean;
  role_name: string;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: updateRole,
    isPending,
    error,
  } = useUpdateRole({
    role_name,
    onSuccess: () => {
      setOpen(false);
      refetch();
      api.success({
        title: 'Role updated successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleUpdateRole = (values: UpdateRoleFormData) => {
    updateRole(values);
  };

  return (
    <>
      {contextHolder}
      <Button
        type="text"
        icon={<IconEdit />}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Edit Role
      </Button>
      <Drawer title="Edit Role" open={open} onClose={() => setOpen(false)}>
        <UpdateRoleForm
          onFinish={handleUpdateRole}
          role_name={role_name}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
