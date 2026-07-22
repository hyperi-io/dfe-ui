import { RbacProtected } from '@/core/components/RbacProtected';
import { useDeleteGovernancePolicy } from '@/Platform/hooks/governance/useDeleteGovernancePolicy';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';
import { DeletePolicyForm, DeletePolicyFormData } from './DeletePolicyForm';

interface DeletePolicyModalProps {
  policy_name: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export const DeletePolicyModal = ({
  policy_name,
  onSuccess,
  disabled,
}: DeletePolicyModalProps) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const { mutate, isPending, error } = useDeleteGovernancePolicy({
    onSuccess: () => {
      onSuccess?.();
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{policy_name}</span> deleted
            successfully
          </>
        ),
        placement: 'bottomLeft',
      });
    },
  });
  const handleDeletePolicy = (values: DeletePolicyFormData) => {
    mutate({ name: values.policy_name });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.governance_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${policy_name}`}
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
            Delete Policy
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type="text"
            htmlType="button"
            className="hover:text-error hover:bg-error/5"
            aria-label={`Delete ${policy_name}`}
            icon={<IconTrash />}
            disabled
          >
            Delete Policy
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Delete Policy"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <DeletePolicyForm
          onFinish={handleDeletePolicy}
          error={error}
          isPending={isPending}
          onCancel={() => setOpen(false)}
          policy_name={policy_name}
        />
      </Modal>
    </>
  );
};
