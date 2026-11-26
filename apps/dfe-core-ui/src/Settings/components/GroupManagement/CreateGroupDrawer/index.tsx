import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateGroupForm,
  CreateUpdateGroupFormData,
} from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { createGroupTransformFormDataToRequest } from '@/Settings/helpers/createUpdateGroupTransforms/createUpdateGroupFormDataToRequest';
import { useCreateGroup } from '@/Settings/hooks/groups/useCreateGroup';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateGroupDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  // The grant names the group it creates, so it is asked for once the engine wants it.
  const [newGroup, setNewGroup] = useState('');
  const reauth = useReauthGrant(newGroup, 'group', 'create');
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: createGroup,
    isPending,
    error,
    reset: resetCreateGroup,
  } = useCreateGroup({
    reauth: reauth.grant,
    onSuccess: () => {
      setIsOpen(false);
      reauth.drop();
      api.success({
        title: 'Group created successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const closeDrawer = () => {
    setIsOpen(false);
    resetCreateGroup();
  };

  const handleCreateGroup = (values: CreateUpdateGroupFormData) => {
    const body = createGroupTransformFormDataToRequest(values);
    setNewGroup(body.name);
    // The engine refuses a create that cannot land before it asks for the password.
    createGroup(body, {
      onError: (refusal) => {
        if (reauth.askIfRequired(refusal, () => createGroup(body))) {
          resetCreateGroup();
        }
      },
    });
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
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'bottomRight' }}
        >
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

      {reauth.modal}
      <Drawer title="Create Group" open={isOpen} onClose={closeDrawer}>
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
