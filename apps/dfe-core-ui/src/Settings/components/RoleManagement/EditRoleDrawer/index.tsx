import { Drawer } from '@/core/components/Drawer';
import { ROLE_DETAIL_QUERY_KEY } from '@/Settings/hooks/useFetchRoleDetail';
import { useUpdateRole } from '@/Settings/hooks/useUpdateRole';
import { IconEdit } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
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

  const queryClient = useQueryClient();

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
      void queryClient.invalidateQueries({
        queryKey: ROLE_DETAIL_QUERY_KEY(role_name),
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
