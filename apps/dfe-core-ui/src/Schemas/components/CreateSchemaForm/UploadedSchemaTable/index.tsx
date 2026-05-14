import { AddSchemaTable } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import {
  PreloadedSchema,
  UploadedSchemaRow,
} from '@/Schemas/components/CreateSchemaForm/types';
import { FormRule } from 'antd';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const UploadedSchemaTable = ({
  formValidation,
  data,
}: {
  formValidation: FormRule;
  data: PreloadedSchema;
}) => {
  const transformedData = useMemo(() => {
    const transformedValues: UploadedSchemaRow[] = data.map((value) => ({
      ...value,
      id: uuidv4(),
      imported: true as const,
    }));
    return transformedValues;
  }, [data]);

  return (
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
  );
};
