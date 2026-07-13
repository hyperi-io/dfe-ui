import { useDeleteRule } from '@/Rules/hooks/useDeleteRule';
import { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconTrash } from '@repo/dfe-icons';
import { Button, ButtonProps, Modal } from 'antd';
import { cloneElement, useState } from 'react';

interface DeleteRuleModalProps {
  rule: TRuleDetail;
  onSuccess?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

export const DeleteRuleModal = ({
  rule,
  onSuccess,
  trigger,
}: DeleteRuleModalProps) => {
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error } = useDeleteRule({
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });
  const handleDeleteRule = () => {
    mutate(rule.name);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.rule_delete}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setOpen(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Button
              type="default"
              shape="circle"
              size="small"
              className="hover:border-error hover:text-error"
              aria-label={`Delete ${rule.display_name ?? rule.name}`}
              icon={<IconTrash />}
              onClick={() => setOpen(true)}
            />
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="justify-start opacity-100"
          tooltip={{ show: true, placement: 'left' }}
        >
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              disabled: true,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setOpen(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <span className="bg-white rounded-full">
              <Button
                type="default"
                shape="circle"
                size="small"
                disabled
                className="hover:border-error hover:text-error"
                aria-label={`Delete ${rule.display_name ?? rule.name}`}
                icon={<IconTrash />}
                onClick={() => setOpen(true)}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${rule.display_name ?? rule.name}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button
              loading={isPending}
              disabled={isPending}
              type="primary"
              danger
              onClick={handleDeleteRule}
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
          </>
        }
      >
        <p>Are you sure you want to delete this rule?</p>
        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
