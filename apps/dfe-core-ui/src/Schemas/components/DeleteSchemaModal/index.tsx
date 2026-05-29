import { FormNotification } from '@/core/components/FormNotification';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { useDeleteSchema } from '@/Schemas/hooks/useDeleteSchema';
import { IconTrash } from '@repo/dfe-icons';
import { Button, Modal, Tooltip } from 'antd';
import { useState } from 'react';

interface DeleteSchemaModalProps {
  schemaPath: string;
  onSuccess?: (schemaPath: string) => void;
}

export const DeleteSchemaModal = ({
  schemaPath,
  onSuccess,
}: DeleteSchemaModalProps) => {
  const [open, setOpen] = useState(false);

  const {
    refetch: refetchSchemas,
    setSelectedSchema,
    selectedSchemaPath,
  } = useListSchemasContext();

  const {
    mutate: deleteSchemaMutation,
    isPending: isDeletingSchema,
    error,
  } = useDeleteSchema({
    onSuccess: () => {
      setOpen(false);
      refetchSchemas();
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
      <Tooltip title={`Delete ${schemaPath}`} destroyOnHidden>
        <Button
          type="default"
          shape="circle"
          size="small"
          loading={isDeletingSchema}
          disabled={isDeletingSchema}
          aria-label={`Delete ${schemaPath}`}
          icon={<IconTrash />}
          onClick={() => setOpen(true)}
        />
      </Tooltip>
      <Modal
        title={`Delete ${schemaPath}`}
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
              onClick={() => deleteSchemaMutation(schemaPath)}
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
        <p>Are you sure you want to delete this schema?</p>

        {error && <FormNotification text={error.message} type="error" />}
      </Modal>
    </>
  );
};
