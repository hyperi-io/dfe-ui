import { FormNotification } from '@/core/components/FormNotification';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteGovernanceAction } from '@/Platform/hooks/governance/useDeleteGovernanceAction';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

interface DeleteActionModalProps {
  action_name: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export const DeleteActionModal = ({
  action_name,
  onSuccess,
  disabled,
}: DeleteActionModalProps) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error } = useDeleteGovernanceAction({
    onSuccess: () => {
      onSuccess?.();
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{action_name}</span> deleted
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
    },
  });
  const handleDeleteAction = () => {
    mutate(action_name);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.governance_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${action_name}`}
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
            Delete Action
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type="text"
            htmlType="button"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${action_name}`}
            icon={<IconTrash />}
            disabled
          >
            Delete Action
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Delete Action"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{action_name}</span>?
        </p>

        {error && <FormNotification text={error?.message} type="error" />}

        <div className="flex w-full justify-end gap-x-2">
          <Button
            loading={isPending}
            disabled={isPending}
            type="primary"
            danger
            onClick={handleDeleteAction}
          >
            Delete
          </Button>
          <Button
            loading={isPending}
            disabled={isPending}
            type="default"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};
