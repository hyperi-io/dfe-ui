import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { useDeleteAccount } from '@/Settings/hooks/accounts/useDeleteAccount';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';
import { DeleteAccountForm, DeleteAccountFormData } from './DeleteAccountForm';

export const DeleteAccountDrawer = ({
  username,
  isActive,

  isExternal,
}: {
  username: string;
  isActive: boolean;

  isExternal: boolean;
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

  const handleDelete = (values: DeleteAccountFormData) => {
    mutate(values.username);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.account_delete}>
        <RbacProtected.Unrestricted>
          {isExternal ? (
            <Tooltip title="Cannot delete external users">
              <Button
                aria-label={title}
                type="text"
                icon={<IconTrash />}
                disabled
                danger
              >
                Delete Account
              </Button>
            </Tooltip>
          ) : (
            <Button
              aria-label={title}
              type="text"
              icon={<IconTrash />}
              onClick={handleOpen}
              danger
            >
              Delete Account
            </Button>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            aria-label={title}
            type="text"
            icon={<IconTrash />}
            onClick={handleOpen}
            disabled
            danger
          >
            Delete Account
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Delete Account"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <DeleteAccountForm
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
