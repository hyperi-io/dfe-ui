import { useDeleteSource } from '@/Sources/hooks/useDeleteSource';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconTrash } from '@repo/dfe-icons';
import { Button, ButtonProps, Modal } from 'antd';
import { cloneElement, useState } from 'react';

interface DeleteSourceModalProps {
  source: string;
  onSuccess?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

export const DeleteSourceModal = ({
  source,
  onSuccess,
  trigger,
}: DeleteSourceModalProps) => {
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error } = useDeleteSource({
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });
  const handleDeleteSource = () => {
    mutate(source);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.source_delete}>
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
              aria-label={`Delete ${source}`}
              icon={<IconTrash />}
              onClick={() => setOpen(true)}
            />
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="opacity-100 justify-start"
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
                aria-label={`Delete ${source}`}
                icon={<IconTrash />}
                onClick={() => setOpen(true)}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${source}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button
              loading={isPending}
              disabled={isPending}
              type="primary"
              danger
              onClick={handleDeleteSource}
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
        <p>Are you sure you want to delete this source?</p>
        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
