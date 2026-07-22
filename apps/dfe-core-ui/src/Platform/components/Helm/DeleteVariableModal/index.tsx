import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { useDeleteHelmFileVariable } from '@/Platform/hooks/helm/useDeleteHelmFileVariable';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button, Modal, Tooltip } from 'antd';
import { useState } from 'react';
import {
  DeleteVariableForm,
  DeleteVariableFormData,
} from './DeleteVariableForm';

interface DeleteVariableModalProps {
  path: string;
  name: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DeleteVariableModal = ({
  className,
  path,
  name,
  onSuccess,
  disabled,
}: DeleteVariableModalProps) => {
  const [open, setOpen] = useState(false);
  const { notification } = App.useApp();

  const {
    mutate: deleteVariable,
    isPending,
    error,
  } = useDeleteHelmFileVariable({
    onSuccess: () => {
      onSuccess?.();
      setOpen(false);
      notification.success({
        title: (
          <>
            <span className="font-semibold">{path}</span> deleted successfully
          </>
        ),
        placement: 'bottomLeft',
      });
    },
  });
  const handleDeleteVariable = (values: DeleteVariableFormData) => {
    deleteVariable({
      name: values.name_path.split('/')[0],
      path: values.name_path.split('/')[1],
    });
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.governance_write}>
        <RbacProtected.Unrestricted>
          <Tooltip destroyOnHidden title={`Delete ${name}/${path} variable`}>
            <Button
              type="text"
              className={cn('hover:text-error hover:bg-error/5', className)}
              aria-label={`Delete ${name}/${path}`}
              icon={<IconTrash />}
              onClick={() => setOpen(true)}
              disabled={disabled}
              size="small"
            />
          </Tooltip>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type="text"
            className={cn('hover:text-error hover:bg-error/5', className)}
            aria-label={`Delete ${name}/${path}`}
            icon={<IconTrash />}
            disabled
            size="small"
          />
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title="Delete Variable"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <DeleteVariableForm
          onFinish={handleDeleteVariable}
          error={error}
          isPending={isPending}
          onCancel={() => setOpen(false)}
          path={path}
          name={name}
        />
      </Modal>
    </>
  );
};
