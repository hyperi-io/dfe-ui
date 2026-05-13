import { Form } from '@/core/components/Form';
import { Table, TableProps } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { SchemaCreateRequestColumn } from '@/Schemas/hooks/useCreateSchema/types';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, FormRule, Tooltip } from 'antd';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import {
  ATTRIBUTE_OPTIONS,
  PRIMITIVE_OPTIONS,
  USE_CASE_OPTIONS,
} from './fieldOptions.constants';

interface SchemaColumn extends SchemaCreateRequestColumn {
  id: string;
  uploaded?: boolean;
}

export const rowSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  type: z.string().min(1, { message: 'Type is required' }),
  attribute: z.array(z.string()).optional(),
  use_case: z.string().optional(),
  expr: z.string().optional(),
  comment: z.string().optional(),
});

/** Stable default so `useEffect` does not treat a new `[]` each render as an update. */
const EMPTY_COLUMNS: Partial<SchemaColumn>[] = [];

function normalizeSchemaColumns(
  columns: Partial<SchemaColumn>[],
): SchemaColumn[] {
  return columns.map((column) => ({
    id: column.id ?? uuidv4(),
    name: column.name ?? '',
    type: column.type ?? '',
    attribute: column.attribute ?? [],
    use_case: column.use_case ?? '',
    expr: column.expr ?? '',
    comment: column.comment ?? '',
  }));
}

interface AddSchemaTableProps extends TableProps<SchemaColumn> {
  initialValues?: Partial<SchemaColumn>[];
  name?: string;
  formValidation: FormRule;
  config?: {
    defaultEditFields?: boolean;
    defaultAddColumns?: boolean;
    defaultRemoveColumns?: boolean;
  };
}
export const AddSchemaTable = ({
  initialValues = EMPTY_COLUMNS,
  name = 'columns',
  formValidation,
  config = {
    defaultEditFields: true,
    defaultAddColumns: true,
    defaultRemoveColumns: true,
  },
  ...tableProps
}: AddSchemaTableProps) => {
  const [schemaColumns, setSchemaColumns] = useState<SchemaColumn[]>(() =>
    normalizeSchemaColumns(initialValues),
  );

  const handleRemoveColumn = (columnId: string) => {
    setSchemaColumns(schemaColumns.filter((column) => column.id !== columnId));
  };

  const handleAddColumn = () => {
    setSchemaColumns([
      ...schemaColumns,
      {
        id: uuidv4(),
        name: '',
        type: '',
        attribute: [],
        use_case: '',
        expr: '',
        comment: '',
      },
    ]);
  };

  const columns = [
    {
      title: config.defaultAddColumns ? (
        <Tooltip title="Add Column" destroyOnHidden>
          <Button
            icon={<IconPlus />}
            size="small"
            shape="circle"
            type="default"
            onClick={handleAddColumn}
          />
        </Tooltip>
      ) : null,
      dataIndex: 'delete',
      key: 'delete',
      align: 'center' as const,
      width: 30,
      render: (_: unknown, record: SchemaColumn) => {
        return config.defaultRemoveColumns ? (
          <Tooltip title="Remove Column" destroyOnHidden>
            <Button
              icon={<IconTrash />}
              size="small"
              shape="circle"
              type="default"
              onClick={() => handleRemoveColumn(record.id)}
            />
          </Tooltip>
        ) : null;
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '16%',
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Form.Item
            name={[name, record.id, 'name']}
            initialValue={record.name}
            rules={[formValidation]}
          >
            <InlineEditInput defaultEditing={config.defaultEditFields} />
          </Form.Item>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '16%',
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Form.Item
            name={[name, record.id, 'type']}
            initialValue={record.type}
            rules={[formValidation]}
          >
            <InlineEditSelect
              options={PRIMITIVE_OPTIONS}
              defaultEditing={config.defaultEditFields}
            />
          </Form.Item>
        );
      },
    },
    {
      title: 'Use Case',
      dataIndex: 'use_case',
      key: 'use_case',
      width: '16%',
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Form.Item
            name={[name, record.id, 'use_case']}
            initialValue={record.use_case}
            rules={[formValidation]}
          >
            <InlineEditSelect options={USE_CASE_OPTIONS} />
          </Form.Item>
        );
      },
    },
    {
      title: 'Attributes',
      dataIndex: 'attribute',
      key: 'attribute',
      width: '16%',
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Form.Item
            name={[name, record.id, 'attribute']}
            initialValue={record.attribute}
            rules={[formValidation]}
          >
            <InlineEditSelect mode="multiple" options={ATTRIBUTE_OPTIONS} />
          </Form.Item>
        );
      },
    },
    {
      title: 'Expression',
      dataIndex: 'expr',
      key: 'expr',
      width: '16%',
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Form.Item
            name={[name, record.id, 'expr']}
            initialValue={record.expr}
            rules={[formValidation]}
          >
            <InlineEditInput />
          </Form.Item>
        );
      },
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      width: '16%',
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Form.Item
            name={[name, record.id, 'comment']}
            initialValue={record.comment ?? ''}
            rules={[formValidation]}
          >
            <InlineEditInput />
          </Form.Item>
        );
      },
    },
  ];

  return (
    <Table<SchemaColumn>
      dataSource={schemaColumns}
      columns={columns}
      scroll={{ y: 280, x: 'max-content' }}
      locale={{
        emptyText: (
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-foreground-muted dark:text-dark-foreground-muted">
              Add columns to your schema
            </p>
            <Button
              size="small"
              className="text-sm"
              type="default"
              onClick={handleAddColumn}
              icon={<IconPlus />}
            >
              Add Column
            </Button>
          </div>
        ),
      }}
      {...tableProps}
    />
  );
};
