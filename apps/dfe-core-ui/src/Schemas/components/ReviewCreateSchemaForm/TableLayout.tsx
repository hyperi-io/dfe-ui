import {
  SchemaCreateRequest,
  SchemaCreateRequestColumn,
} from '@/Schemas/hooks/useCreateSchema/types';
import { Button } from 'antd';
import React, { useMemo } from 'react';

interface TableLayoutProps {
  values: SchemaCreateRequest;
  uploadedColumns?: SchemaCreateRequestColumn[];
  schemaColumns?: SchemaCreateRequestColumn[];
  onFinish?: () => void;
  buttonLabel: string;
}

const formatValues = (values: SchemaCreateRequest) => {
  return [
    {
      label: 'File pathname',
      value: `${values.path}.yaml`,
    },
    {
      label: 'Current Version',
      value: values.current,
    },
    ...(values.description
      ? [
          {
            label: 'Description',
            value: values.description,
          },
        ]
      : []),
  ];
};

export const TableLayout = ({
  values,
  uploadedColumns: _uploadedColumns,
  schemaColumns: _schemaColumns,
  onFinish,
  buttonLabel,
}: TableLayoutProps) => {
  const handleFinish = () => {
    onFinish?.();
  };

  const formattedValues = useMemo(() => formatValues(values), [values]);

  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
        {formattedValues.map(({ label, value }) => (
          <React.Fragment key={label.toLowerCase().replaceAll(' ', '-')}>
            <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
              {label}:
            </dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>

      <Button type="primary" className="ml-auto" onClick={handleFinish}>
        {buttonLabel}
      </Button>
    </div>
  );
};
