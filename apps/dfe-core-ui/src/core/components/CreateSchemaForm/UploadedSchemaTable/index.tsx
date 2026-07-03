import { AddSchemaTable } from '@/core/components/CreateSchemaForm/AddSchemaTable';
import { useCreateSchemaFormContext } from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import { InvalidColumnsTable } from '@/core/components/CreateSchemaForm/InvalidColumnsTable';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';

export const UploadedSchemaTable = () => {
  const {
    formValidation,
    invalidUploadedSchemaColumns,
    uploadedSchemaColumns,
    handleRemoveUploadedSchemaColumn,
  } = useCreateSchemaFormContext();

  const hasInvalidColumns = invalidUploadedSchemaColumns.length > 0;
  const { componentHeight } = useSetComponentHeight({
    offset: 620,
  });

  return (
    <div className="flex flex-col gap-y-4">
      {hasInvalidColumns && <InvalidColumnsTable />}

      <div className="flex flex-col gap-y-2">
        {hasInvalidColumns && (
          <label htmlFor="uploadedColumns">Uploaded Columns</label>
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
          scroll={{
            y: componentHeight,
            x: 'max-content',
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
