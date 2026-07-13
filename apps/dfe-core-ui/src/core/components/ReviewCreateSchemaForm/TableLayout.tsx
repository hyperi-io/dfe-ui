import { FormNotification } from '@/core/components/FormNotification';
import { SchemaTable } from '@/core/components/SchemaTable';
import { fieldTypeIconSwitch } from '@/core/constants/resourceType.constants';
import { useCreateSchemaReviewContext } from '@/core/contexts/CreateSchemaReviewContext';
import { TCreateSchemaRequest } from '@/core/hooks/useCreateSchema/types';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button, Input, Select, Tooltip } from 'antd';
import { useMemo, useState } from 'react';

interface TableLayoutProps {
  formValues: CreateSchemaFormData;
  requestBody: TCreateSchemaRequest;
  onFinish?: () => void;
  buttonLabel: string;
  hideFields?: {
    version?: boolean;
  };
}

const SEARCH_DEBOUNCE_MS = 300;

export const TableLayout = ({
  formValues,
  requestBody,
  onFinish,
  buttonLabel,
  hideFields,
}: TableLayoutProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const [showVersion, setShowVersion] = useState<string>(requestBody.current);

  const { handleGoBack, formErrorMessage } = useCreateSchemaReviewContext();

  const { componentHeight } = useSetComponentHeight({
    offset: 380,
  });

  const handleFinish = () => {
    onFinish?.();
  };

  const allColumns = useMemo(() => {
    return [
      ...(formValues.uploadedColumns ?? []),
      ...(formValues.schemaColumns ?? []),
    ];
  }, [formValues.uploadedColumns, formValues.schemaColumns]);

  const filteredColumns = useMemo(() => {
    return allColumns.filter((column) =>
      column.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [allColumns, debouncedSearch]);

  const tableColumns = [
    {
      title: '',
      dataIndex: '_field_type',
      key: '_field_type',
      width: 30,
      render: (value: string) => {
        return (
          <Tooltip title={value} destroyOnHidden>
            <span>{fieldTypeIconSwitch(value)}</span>
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
      title: 'Index Type',
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
      title: 'Expression (CTE)',
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
          <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
            File pathname:
          </dt>
          <dd>{`${requestBody.path}.yaml`}</dd>

          {!hideFields?.version && (
            <>
              <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
                Current Version:
              </dt>
              <dd>{requestBody.current}</dd>
            </>
          )}
          {requestBody.versions[requestBody.current]?.summary && (
            <>
              <dt className="font-medium text-foreground/40 dark:text-dark-foreground/40">
                Summary:
              </dt>
              <dd>{requestBody.versions[requestBody.current]?.summary}</dd>
            </>
          )}
        </dl>
        {!hideFields?.version && (
          <div className="flex flex-row gap-2 items-center mb-auto">
            <p>Version:</p>
            <Select
              className="w-48"
              options={Object.keys(requestBody.versions ?? {}).map(
                (version) => ({
                  label: version,
                  value: version,
                }),
              )}
              value={showVersion}
              onChange={(value) => {
                setShowVersion(value);
              }}
            />
          </div>
        )}
      </div>

      <SchemaTable
        visibleColumns={[
          '_field_type',
          '__rowId',
          '_field_type',
          'name',
          'type',
          'main_action',
          'expr',
          'comment',
        ]}
        lockedColumns={[
          '_field_type',
          '__rowId',
          '_field_type',
          'main_action',
          'name',
        ]}
        columns={tableColumns}
        dataSource={filteredColumns}
        rowKey="name"
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        title={() => (
          <div className="flex items-center justify-between w-full">
            <span className="font-medium">Columns</span>
            <Input.Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-auto w-96"
              placeholder="Search"
              allowClear
            />
          </div>
        )}
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
        <FormNotification
          type="error"
          title={formErrorMessage.message}
          text={formErrorMessage.errors
            ?.map((error) => error?.message)
            .join(', ')}
        />
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
