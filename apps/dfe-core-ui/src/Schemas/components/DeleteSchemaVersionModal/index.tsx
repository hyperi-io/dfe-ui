import { FormNotification } from '@/core/components/FormNotification';
import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { useDeleteSchemaVersion } from '@/Schemas/hooks/useDeleteSchemaVersion';
import { IconTrash } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

interface DeleteSchemaVersionModalProps {
  schemaPath: string;
  version: string;
  onSuccess?: (schemaPath: string) => void;
}

export const DeleteSchemaVersionModal = ({
  schemaPath,
  version,
  onSuccess,
}: DeleteSchemaVersionModalProps) => {
  const [open, setOpen] = useState(false);

  const { setSelectedSchema, selectedSchemaPath } = useListSchemasContext();

  const { notification } = App.useApp();

  const {
    mutate: deleteSchemaMutation,
    isPending: isDeletingSchema,
    error,
  } = useDeleteSchemaVersion({
    onSuccess: () => {
      setOpen(false);
      notification.success({
        title: 'Schema version deleted successfully',
        description: `${schemaPath} - ${version} has been deleted successfully`,
      });
      onSuccess?.(schemaPath);
      if (selectedSchemaPath === schemaPath) {
        setSelectedSchema({
          schema_path: null,
          schema_version: null,
        });
      }
    },
  });
  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.schema_delete}>
        <RbacProtected.Unrestricted>
          <Tooltip title={`Delete ${schemaPath}`} destroyOnHidden>
            <Button
              type="default"
              shape="circle"
              size="small"
              loading={isDeletingSchema}
              disabled={isDeletingSchema}
              onClick={() => setOpen(true)}
              aria-label={`Delete ${schemaPath}`}
              icon={<IconTrash />}
            />
          </Tooltip>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'top' }}
          className="opacity-100"
        >
          <span className="bg-white rounded-full">
            <Button
              type="default"
              aria-label={`Delete ${schemaPath}`}
              icon={<IconTrash />}
              disabled
              shape="circle"
              size="small"
            />
          </span>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Delete ${schemaPath} - ${version}`}
        open={open}
        onCancel={() => {
          if (isDeletingSchema) return;
          setOpen(false);
        }}
        confirmLoading={isDeletingSchema}
        footer={
          <>
            <Button
              loading={isDeletingSchema}
              disabled={isDeletingSchema}
              type="primary"
              danger
              onClick={() => deleteSchemaMutation({ schemaPath, version })}
            >
              Delete
            </Button>
            <Button
              loading={isDeletingSchema}
              disabled={isDeletingSchema}
              type="default"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
        destroyOnHidden
      >
        <p>Are you sure you want to delete this schema version?</p>

        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
