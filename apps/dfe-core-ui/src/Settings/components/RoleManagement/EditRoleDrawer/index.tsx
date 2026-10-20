import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useUpdateRole } from '@/Settings/hooks/roles/useUpdateRole';
import { IconEdit } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { UpdateRoleForm, UpdateRoleFormData } from './UpdateRoleForm';

export const EditRoleDrawer = ({
  disabled,
  role_name,
}: {
  disabled?: boolean;
  role_name: string;
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
      api.success({
        title: 'Role updated successfully',
        placement: 'bottomLeft',
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.roles.role({ name: role_name }),
      });
    },
  });

  const handleUpdateRole = (values: UpdateRoleFormData) => {
    updateRole(values);
  };

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.role_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            icon={<IconEdit />}
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            Edit Role
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" htmlType="button" icon={<IconEdit />} disabled>
            Edit Role
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

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
