import { useDeleteHunt } from '@/Hunts/hooks/useDeleteHunt';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconTrash } from '@repo/dfe-icons';
import { Button, ButtonProps, Modal, Tooltip } from 'antd';
import { cloneElement, useState } from 'react';

interface DeleteHuntModalProps {
  hunt: THuntDetailResponse;
  onSuccess?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
}

export const DeleteHuntModal = ({
  hunt,
  onSuccess,
  trigger,
}: DeleteHuntModalProps) => {
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error } = useDeleteHunt({
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });
  const handleDeleteHunt = () => {
    mutate(hunt.name);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.hunt_delete}>
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
            <Tooltip
              destroyOnHidden
              title={`Delete ${hunt.display_name ?? hunt.name}`}
            >
              <Button
                type="default"
                shape="circle"
                size="small"
                className="hover:border-error hover:text-error"
                aria-label={`Delete ${hunt.display_name ?? hunt.name}`}
                icon={<IconTrash />}
                onClick={() => setOpen(true)}
              />
            </Tooltip>
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
                aria-label={`Delete ${hunt.display_name ?? hunt.name}`}
                icon={<IconTrash />}
                onClick={() => setOpen(true)}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${hunt.display_name ?? hunt.name}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button
              loading={isPending}
              disabled={isPending}
              type="primary"
              danger
              onClick={handleDeleteHunt}
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
        <p>Are you sure you want to delete this hunt?</p>
        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
