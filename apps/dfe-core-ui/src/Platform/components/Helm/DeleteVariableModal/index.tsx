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
      <span className={cn('inline-flex', className)}>
        <RbacProtected action={RbacProtected.rbacActions.helmvars_write}>
          <RbacProtected.Unrestricted>
            <Tooltip destroyOnHidden title={`Delete ${name}/${path} variable`}>
              <span className="inline-flex">
                <Button
                  type="text"
                  className="hover:text-error hover:bg-error/5"
                  aria-label={`Delete ${name}/${path}`}
                  icon={<IconTrash />}
                  onClick={() => setOpen(true)}
                  disabled={disabled}
                  size="small"
                />
              </span>
            </Tooltip>
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted
            tooltip={{ show: true, placement: 'bottomRight', trigger: 'hover' }}
          >
            <Button
              type="text"
              className="hover:text-error hover:bg-error/5"
              aria-label={`Delete ${name}/${path}`}
              icon={<IconTrash />}
              disabled
              size="small"
            />
          </RbacProtected.Restricted>
        </RbacProtected>
      </span>

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
