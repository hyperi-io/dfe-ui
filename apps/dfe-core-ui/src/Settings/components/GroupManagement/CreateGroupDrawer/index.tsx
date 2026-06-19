import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateGroupForm,
  CreateUpdateGroupFormData,
} from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { useCreateGroup } from '@/Settings/hooks/useCreateGroup';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateGroupDrawer = ({ refetch }: { refetch: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: createGroup,
    isPending,
    error,
  } = useCreateGroup({
    onSuccess: () => {
      setIsOpen(false);
      refetch();
      api.success({
        title: 'Group created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleCreateGroup = (values: CreateUpdateGroupFormData) => {
    const { name, description, roles, members = [] } = values;
    createGroup({ name, description, roles, members });
  };

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.group_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="primary"
            onClick={() => setIsOpen(true)}
            icon={<IconPlus />}
          >
            Configure New Group
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <Button
            type="primary"
            disabled
            onClick={() => setIsOpen(true)}
            icon={<IconPlus />}
          >
            Configure New Group
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Create Group"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <CreateUpdateGroupForm
          name="create-group-form"
          onFinish={handleCreateGroup}
          error={error}
          isPending={isPending}
          buttonLabel="Create Group"
          showMembersField
        />
      </Drawer>
    </>
  );
};
