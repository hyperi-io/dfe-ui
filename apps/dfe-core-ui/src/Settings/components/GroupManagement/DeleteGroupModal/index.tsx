import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteGroup } from '@/Settings/hooks/groups/useDeleteGroup';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useRef, useState } from 'react';
import { DeleteGroupForm } from './DeleteGroupForm';

export const DeleteGroupModal = ({ group_name }: { group_name: string }) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  // Every delete asks for the password again.
  const grant = useRef<string>(undefined);
  const { mutate, isPending, error, reset } = useDeleteGroup({
    reauth: () => grant.current,
    onSuccess: () => {
      grant.current = undefined;
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

  const close = () => {
    reset();
    setOpen(false);
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
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button disabled type="text" icon={<IconTrash />}>
            Delete Group
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${group_name}?`}
        open={open}
        onCancel={close}
        footer={null}
        destroyOnHidden
      >
        <DeleteGroupForm
          onConfirm={(granted) => {
            grant.current = granted;
            mutate(group_name);
          }}
          error={error}
          isPending={isPending}
          onCancel={close}
          group_name={group_name}
        />
      </Modal>
    </>
  );
};
