import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteAccount } from '@/Settings/hooks/useDeleteAccount';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';
import { DeleteUserForm, DeleteUserFormData } from './DeleteUserForm';

export const DeleteUserDrawer = ({
  username,
  isActive,
  refetch,
}: {
  username: string;
  isActive: boolean;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();
  const title = `Delete ${username}`;

  const { mutate, isPending, error } = useDeleteAccount({
    onSuccess: () => {
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{username}</span> deleted
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
      refetch();
    },
  });

  const handleOpen = () => {
    if (isActive) {
      notification.error({
        title: 'User is active',
        description: 'Please deactivate them first.',
        placement: 'bottomLeft',
      });
      return;
    }
    setOpen(true);
  };

  const handleDelete = (_values: DeleteUserFormData) => {
    mutate(username);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.account_delete}>
        <RbacProtected.Unrestricted>
          <Button
            aria-label={title}
            type="text"
            icon={<IconTrash />}
            onClick={handleOpen}
            danger
          >
            Delete User
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <Button
            aria-label={title}
            type="text"
            icon={<IconTrash />}
            onClick={handleOpen}
            disabled
            danger
          >
            Delete User
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Delete User"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <DeleteUserForm
          username={username}
          onFinish={handleDelete}
          error={error}
          isPending={isPending}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
};
