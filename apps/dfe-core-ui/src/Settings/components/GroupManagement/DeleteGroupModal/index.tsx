import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteGroup } from '@/Settings/hooks/groups/useDeleteGroup';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';
import { DeleteGroupForm, DeleteGroupFormData } from './DeleteGroupForm';

export const DeleteGroupModal = ({ group_name }: { group_name: string }) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  // Every delete asks for the password again.
  const reauth = useReauthGrant(group_name, 'group');
  const { mutate, isPending, error } = useDeleteGroup({
    reauth: reauth.grant,
    onSuccess: () => {
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{group_name}</span> deleted
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
    },
  });

  const handleDeleteGroup = (values: DeleteGroupFormData) => {
    mutate(values.group_name);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.group_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${group_name}`}
            icon={<IconTrash />}
            onClick={() => reauth.ask(() => setOpen(true))}
          >
            Delete Group
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            disabled
            type="text"
            icon={<IconTrash />}
            onClick={() => reauth.ask(() => setOpen(true))}
          >
            Delete Group
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      {reauth.modal}
      <Modal
        title="Delete Group"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <DeleteGroupForm
          onFinish={handleDeleteGroup}
          error={error}
          isPending={isPending}
          onCancel={() => setOpen(false)}
          group_name={group_name}
        />
      </Modal>
    </>
  );
};
