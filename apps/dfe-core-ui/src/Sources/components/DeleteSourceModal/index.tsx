import { useDeleteSource } from '@/Sources/hooks/useDeleteSource';

import { FormNotification } from '@/core/components/FormNotification';
import { IconTrash } from '@dfe/icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';

export const DeleteSourceModal = ({
  source,
  onSuccess,
}: {
  source: string;
  onSuccess?: () => void;
}) => {
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
      <Button
        type="default"
        shape="circle"
        aria-label={`Delete ${source}`}
        icon={<IconTrash />}
        onClick={() => setOpen(true)}
        danger
      />
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
