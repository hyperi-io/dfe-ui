import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteGroup } from '@/Settings/hooks/useDeleteGroup';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';
import { DeleteGroupForm, DeleteGroupFormData } from './DeleteGroupForm';

export const DeleteGroupModal = ({
  group_name,
  refetch,
}: {
  group_name: string;
  refetch: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error } = useDeleteGroup({
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
      refetch();
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
            onClick={() => setOpen(true)}
          >
            Delete Group
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <Button
            disabled
            type="text"
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
          >
            Delete Group
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

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
