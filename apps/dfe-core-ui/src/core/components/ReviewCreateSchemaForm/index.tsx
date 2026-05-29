import { SchemaCreateRequest } from '@/core/hooks/useCreateSchema/types';
import { transformFormDataToRequestBody as transformCreateSchemaFormDataToRequestBody } from '@/core/hooks/useCreateSchema/useCreateSchema.helpers';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { Radio } from 'antd';
import { useState } from 'react';
import { TableLayout } from './TableLayout';
import { YamlLayout } from './YamlLayout';

export type ReviewFormTransform = (values: CreateSchemaFormData) => {
  requestBody: SchemaCreateRequest;
};

export interface ReviewFormProps {
  values: CreateSchemaFormData | null;
  onFinish?: (values: CreateSchemaFormData) => void;
  buttonLabel: string;
  hideFields?: {
    version?: boolean;
  };
  transformToReview?: ReviewFormTransform;
}

export const ReviewForm = ({
  values,
  onFinish,
  buttonLabel,
  hideFields,
  transformToReview = transformCreateSchemaFormDataToRequestBody,
}: ReviewFormProps) => {
  const [selectedLayout, setSelectedLayout] = useState<'table' | 'yaml'>(
    'table',
  );

  if (!values) {
    return (
      <div className="text-foreground-muted dark:text-dark-foreground-muted">
        Nothing to review.
      </div>
    );
  }

  const { requestBody } = transformToReview(values);

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
          formValues={values}
          requestBody={requestBody}
          onFinish={handleFinish}
          buttonLabel={buttonLabel}
          hideFields={hideFields}
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
