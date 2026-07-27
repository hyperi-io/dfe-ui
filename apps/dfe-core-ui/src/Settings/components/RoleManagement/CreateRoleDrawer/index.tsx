import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateRoleForm,
  CreateUpdateRoleFormData,
} from '@/Settings/components/RoleManagement/CreateUpdateRoleForm';
import { useCreateRole } from '@/Settings/hooks/roles/useCreateRole';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateRoleDrawer = ({ refetch }: { refetch: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: createRole,
    isPending,
    error,
  } = useCreateRole({
    onSuccess: () => {
      setIsOpen(false);
      refetch();
      api.success({
        title: 'Role created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleCreateRole = (values: CreateUpdateRoleFormData) => {
    createRole(values);
  };
  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.role_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            onClick={() => setIsOpen(true)}
            icon={<IconPlus />}
          >
            Configure New Custom Role
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'bottomRight' }}
        >
          <Button htmlType="button" type="primary" icon={<IconPlus />} disabled>
            Configure New Custom Role
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Create Custom Role"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <CreateUpdateRoleForm
          name="create-role-form"
          onFinish={handleCreateRole}
          error={error}
          isPending={isPending}
          buttonLabel="Create Role"
        />
      </Drawer>
    </>
  );
};
