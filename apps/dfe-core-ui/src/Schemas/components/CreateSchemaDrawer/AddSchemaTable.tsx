import { Form } from '@/core/components/Form';
import { Table } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { SchemaCreateRequestColumn } from '@/Schemas/hooks/useCreateSchema/types';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, Tooltip } from 'antd';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ATTRIBUTE_OPTIONS,
  PRIMITIVE_OPTIONS,
  USE_CASE_OPTIONS,
} from './fieldOptions.constants';

interface SchemaColumn extends SchemaCreateRequestColumn {
  id: string;
  uploaded?: boolean;
}

/** Stable default so `useEffect` does not treat a new `[]` each render as an update. */
const EMPTY_COLUMNS: Partial<SchemaColumn>[] = [];

function normalizeSchemaColumns(
  columns: Partial<SchemaColumn>[],
): SchemaColumn[] {
  return columns.map((column) => ({
    id: column.id ?? uuidv4(),
    name: column.name ?? '',
    type: column.type ?? '',
    attribute: Array.isArray(column.attribute)
      ? column.attribute
      : column.attribute !== undefined && column.attribute !== ''
        ? [column.attribute as string]
        : [],
    use_case: column.use_case === null ? '' : (column.use_case ?? ''),
    expr: column.expr === null ? '' : (column.expr ?? ''),
    comment: column.comment === null ? '' : (column.comment ?? null),
  }));
}

export const AddSchemaTable = ({
  initialValues = EMPTY_COLUMNS,
  name = 'columns',
}: {
  initialValues?: Partial<SchemaColumn>[];
  name?: string;
}) => {
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
        comment: null,
      },
    ]);
  };

  const columns = [
    {
      title: (
        <Tooltip title="Add Column" destroyOnHidden>
          <Button
            icon={<IconPlus />}
            size="small"
            shape="circle"
            type="default"
            onClick={handleAddColumn}
          />
        </Tooltip>
      ),
      dataIndex: 'delete',
      key: 'delete',
      width: 30,
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Tooltip title="Remove Column" destroyOnHidden>
            <Button
              icon={<IconTrash />}
              size="small"
              shape="circle"
              type="default"
              onClick={() => handleRemoveColumn(record.id)}
            />
          </Tooltip>
        );
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
          >
            <InlineEditInput />
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
          >
            <InlineEditSelect options={PRIMITIVE_OPTIONS} />
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
          >
            <InlineEditSelect options={USE_CASE_OPTIONS} />
          </Form.Item>
        );
      },
    },
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      key: 'attribute',
      width: '16%',
      render: (_: unknown, record: SchemaColumn) => {
        return (
          <Form.Item
            name={[name, record.id, 'attribute']}
            initialValue={record.attribute}
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
    />
  );
};
