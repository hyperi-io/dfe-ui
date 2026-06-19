import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useUpdateGroup } from '@/Settings/hooks/useUpdateGroup';
import { IconEdit } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { UpdateGroupForm, UpdateGroupFormData } from './UpdateGroupForm';

export const EditGroupDrawer = ({
  group_name,
  refetch,
}: {
  group_name: string;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const {
    mutate: updateGroup,
    isPending,
    error,
  } = useUpdateGroup({
    group_name,
    onSuccess: () => {
      setOpen(false);
      refetch();
      api.success({
        title: 'Group updated successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const handleUpdateGroup = (values: UpdateGroupFormData) => {
    updateGroup(values);
  };

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.group_write}>
        <RbacProtected.Unrestricted>
          <Button type="text" icon={<IconEdit />} onClick={() => setOpen(true)}>
            Edit Group
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            disabled
            type="text"
            icon={<IconEdit />}
            onClick={() => setOpen(true)}
          >
            Edit Group
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer title="Edit Group" open={open} onClose={() => setOpen(false)}>
        <UpdateGroupForm
          onFinish={handleUpdateGroup}
          group_name={group_name}
          error={error}
          isPending={isPending}
        />
      </Drawer>
    </>
  );
};
