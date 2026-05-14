import { AddSchemaTable } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { useCreateSchemaFormContext } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.context';
import { InvalidColumnsCollapse } from '@/Schemas/components/CreateSchemaForm/InvalidColumnsCollapse';

export const UploadedSchemaTable = () => {
  const {
    formValidation,
    invalidUploadedSchemaColumns,
    uploadedSchemaColumns,
  } = useCreateSchemaFormContext();

  return (
    <div className="flex flex-col gap-y-4">
      {invalidUploadedSchemaColumns.length > 0 && (
        <InvalidColumnsCollapse
          invalidColumns={invalidUploadedSchemaColumns}
          formValidation={formValidation}
        />
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
      />
    </div>
  );
};
