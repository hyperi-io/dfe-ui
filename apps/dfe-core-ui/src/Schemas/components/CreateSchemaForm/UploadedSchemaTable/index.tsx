import {
  AddSchemaTable,
  rowSchema,
} from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { InvalidColumnsCollapse } from '@/Schemas/components/CreateSchemaForm/InvalidColumnsCollapse';
import {
  PreloadedSchema,
  UploadedSchemaRow,
} from '@/Schemas/components/CreateSchemaForm/types';
import { FormInstance, FormRule } from 'antd';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CreateSchemaFormData } from '..';

export const UploadedSchemaTable = ({
  formValidation,
  data,
  form,
}: {
  formValidation: FormRule;
  data: PreloadedSchema;
  form: FormInstance<CreateSchemaFormData>;
}) => {
  const transformedData = useMemo(() => {
    const transformedValues: UploadedSchemaRow[] = data.map((value) => ({
      ...value,
      id: uuidv4(),
      imported: true as const,
    }));
    return transformedValues;
  }, [data]);

  const validatedData = useMemo(() => {
    return transformedData.map((value) => {
      const validationResult = rowSchema.safeParse(value);
      if (!validationResult.success) {
        return {
          ...validationResult,
          data: value,
        };
      }
      return validationResult;
    });
  }, [transformedData]);

  const invalidData = useMemo(() => {
    return validatedData.filter((value) => !value.success);
  }, [validatedData]);

  return (
    <div className="flex flex-col gap-y-4">
      {invalidData.length > 0 && (
        <InvalidColumnsCollapse
          invalidColumns={invalidData}
          formValidation={formValidation}
          form={form}
        />
      )}

      <AddSchemaTable
        name="uploadedColumns"
        initialValues={transformedData}
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
