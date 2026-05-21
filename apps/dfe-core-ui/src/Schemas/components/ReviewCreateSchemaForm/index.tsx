import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { transformFormDataToRequestBody } from '@/Schemas/hooks/useCreateSchema/useCreateSchema.helpers';
import { Radio } from 'antd';
import { useState } from 'react';
import { TableLayout } from './TableLayout';
import { YamlLayout } from './YamlLayout';

export interface ReviewFormProps {
  values: CreateSchemaFormData;
  onFinish?: (values: CreateSchemaFormData) => void;
  buttonLabel: string;
}

export const ReviewForm = ({
  values,
  onFinish,
  buttonLabel,
}: ReviewFormProps) => {
  const [selectedLayout, setSelectedLayout] = useState<'table' | 'yaml'>(
    'table',
  );

  const { requestBody, uploadedColumns, schemaColumns } =
    transformFormDataToRequestBody(values);

  const handleFinish = () => {
    onFinish?.(values);
  };

  return (
    <div className="flex flex-col gap-2">
      <Radio.Group
        className="flex flex-row w-full"
        value={selectedLayout}
        onChange={(e) => setSelectedLayout(e.target.value as 'table' | 'yaml')}
      >
        <Radio.Button className="w-1/2 text-center" value="table">
          Table
        </Radio.Button>
        <Radio.Button className="w-1/2 text-center" value="yaml">
          YAML
        </Radio.Button>
      </Radio.Group>

      {selectedLayout === 'table' && (
        <TableLayout
          values={requestBody}
          uploadedColumns={uploadedColumns}
          schemaColumns={schemaColumns}
          onFinish={handleFinish}
          buttonLabel={buttonLabel}
        />
      )}
      {selectedLayout === 'yaml' && (
        <YamlLayout
          values={requestBody}
          onFinish={handleFinish}
          buttonLabel={buttonLabel}
        />
      )}
    </div>
  );
};
