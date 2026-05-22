import { FormNotification } from '@/core/components/FormNotification';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { useCreateSchemaReviewContext } from '@/Schemas/contexts/CreateSchemaReviewContext';
import { SchemaCreateRequest } from '@/Schemas/hooks/useCreateSchema/types';
import { IconHandFinger, IconInfoCircle, IconUpload } from '@repo/dfe-icons';
import { Button, Select, Table, Tooltip } from 'antd';
import React, { useMemo, useState } from 'react';

interface TableLayoutProps {
  formValues: CreateSchemaFormData;
  requestBody: SchemaCreateRequest;
  onFinish?: () => void;
  buttonLabel: string;
}

const formatValues = (requestBody: SchemaCreateRequest) => {
  return [
    {
      label: 'File pathname',
      value: `${requestBody.path}.yaml`,
    },
    {
      label: 'Current Version',
      value: requestBody.current,
    },
    ...(requestBody.versions[requestBody.current]?.summary
      ? [
          {
            label: 'Summary',
            value: requestBody.versions[requestBody.current]?.summary,
          },
        ]
      : []),
  ];
};

export const TableLayout = ({
  formValues,
  requestBody,
  onFinish,
  buttonLabel,
}: TableLayoutProps) => {
  const [showVersion, setShowVersion] = useState<string>(requestBody.current);

  const { handleGoBack, formErrorMessage } = useCreateSchemaReviewContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 380,
  });

  const handleFinish = () => {
    onFinish?.();
  };

  const formattedValues = useMemo(
    () => formatValues(requestBody),
    [requestBody],
  );

  const allColumns = useMemo(() => {
    return [
      ...(formValues.uploadedColumns ?? []),
      ...(formValues.schemaColumns ?? []),
    ];
  }, [formValues.uploadedColumns, formValues.schemaColumns]);

  const tableColumns = [
    {
      title: '',
      dataIndex: 'imported',
      key: 'imported',
      width: 30,
      render: (imported: boolean) => {
        return (
          <Tooltip title={imported ? 'Imported' : 'Manual'} destroyOnHidden>
            <span>{imported ? <IconUpload /> : <IconHandFinger />}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      key: 'attribute',
      render: (attribute: string[]) => {
        return attribute?.length > 0 ? (
          attribute.join(', ')
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
    {
      title: 'Use Case',
      dataIndex: 'use_case',
      key: 'use_case',
      render: (use_case: string) => {
        return use_case ? (
          use_case
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
    {
      title: 'Expr',
      dataIndex: 'expr',
      key: 'expr',
      render: (expr: string) => {
        return expr ? (
          expr
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string) => {
        return comment ? (
          comment
        ) : (
          <span className="text-foreground/40 dark:text-dark-foreground/40">
            None
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full justify-between">
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
        <div className="flex flex-row gap-2 items-center mb-auto">
          <p>Version:</p>
          <Select
            className="w-48"
            options={Object.keys(requestBody.versions ?? {}).map((version) => ({
              label: version,
              value: version,
            }))}
            value={showVersion}
            onChange={(value) => {
              setShowVersion(value);
            }}
          />
        </div>
      </div>

      <Table
        columns={tableColumns}
        dataSource={allColumns}
        rowKey="name"
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        locale={{
          emptyText: (
            <div className="flex items-center justify-center gap-2 text-foreground-muted dark:text-dark-foreground-muted">
              <IconInfoCircle className="w-4 h-4" />
              <p>No columns loaded</p>
            </div>
          ),
        }}
        scroll={{ y: componentHeight }}
      />

      {formErrorMessage && (
        <FormNotification type="error" text={formErrorMessage} />
      )}
      <div className="flex flex-row gap-2 items-center ml-auto">
        <Button type="default" onClick={handleGoBack}>
          Back
        </Button>
        <Button type="primary" className="ml-auto" onClick={handleFinish}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
