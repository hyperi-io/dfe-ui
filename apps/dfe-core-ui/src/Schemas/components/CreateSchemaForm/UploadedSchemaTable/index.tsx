import { AddSchemaTable } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { useCreateSchemaFormContext } from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import { InvalidColumnsCollapse } from '@/Schemas/components/CreateSchemaForm/InvalidColumnsCollapse';

export const UploadedSchemaTable = () => {
  const {
    formValidation,
    invalidUploadedSchemaColumns,
    uploadedSchemaColumns,
    handleRemoveUploadedSchemaColumn,
  } = useCreateSchemaFormContext();

  const hasInvalidColumns = invalidUploadedSchemaColumns.length > 0;

  return (
    <div className="flex flex-col gap-y-4">
      {hasInvalidColumns && <InvalidColumnsCollapse />}

      <div className="flex flex-col gap-y-2">
        {hasInvalidColumns && (
          <label htmlFor="uploadedColumns">Valid Columns</label>
        )}
        <AddSchemaTable
          name="uploadedColumns"
          initialValues={uploadedSchemaColumns}
          formValidation={formValidation}
          config={{
            defaultEditFields: false,
            defaultAddColumns: false,
            defaultRemoveColumns: true,
          }}
          pagination={{
            defaultPageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: [10, 25, 50, 100],
          }}
          onRemoveRow={(row) =>
            handleRemoveUploadedSchemaColumn(
              typeof row?.id === 'string' ? row.id : undefined,
            )
          }
        />
      </div>
    </div>
  );
};
