import { Form } from '@/core/components/Form';
import { Table, TableProps } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { SchemaCreateRequestColumn } from '@/Schemas/hooks/useCreateSchema/types';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import type { FormListFieldData } from 'antd/es/form';
import { Button, FormRule, Tooltip } from 'antd';
import { useLayoutEffect } from 'react';
import z from 'zod';
import {
  ATTRIBUTE_OPTIONS,
  PRIMITIVE_OPTIONS,
  USE_CASE_OPTIONS,
} from './fieldOptions.constants';

const NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
export const rowSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => NAME_REGEX.test(v), {
      message:
        'Name must contain only letters, numbers, underscores, full stops, and hyphens',
    }),
  type: z.string().min(1, { message: 'Type is required' }),
  attribute: z.array(z.string()).optional(),
  use_case: z.string().optional(),
  expr: z.string().optional(),
  comment: z.string().optional(),
});

type SchemaColumnRow = Partial<SchemaCreateRequestColumn> & {
  id?: string;
  uploaded?: boolean;
};

/** Stable default so layout effect does not treat a new `[]` each render as an update. */
const EMPTY_COLUMNS: SchemaColumnRow[] = [];

function rowLookup(column: SchemaColumnRow, ...aliases: string[]): unknown {
  const rec = column as Record<string, unknown>;
  for (const key of aliases) {
    const v = rec[key];
    if (v !== undefined && v !== '' && v !== null) return v;
  }
  const lowerMap = Object.keys(rec).reduce<Record<string, string>>((acc, k) => {
    acc[k.toLowerCase()] = k;
    return acc;
  }, {});
  for (const key of aliases) {
    const actual = lowerMap[key.toLowerCase()];
    if (actual === undefined) continue;
    const v = rec[actual];
    if (v !== undefined && v !== '' && v !== null) return v;
  }
  return undefined;
}

function normalizeAttribute(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.includes(',')) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  return [];
}

function listItemFromPartial(
  column: SchemaColumnRow,
): z.infer<typeof rowSchema> {
  const name = String(rowLookup(column, 'name', 'Name') ?? '');
  const type = String(rowLookup(column, 'type', 'Type') ?? '');
  const attributeRaw =
    rowLookup(column, 'attribute', 'Attribute') ?? column.attribute;
  const use_case = String(
    rowLookup(column, 'use_case', 'Use Case', 'UseCase') ?? column.use_case ?? '',
  );
  const expr = String(rowLookup(column, 'expr', 'Expr') ?? column.expr ?? '');
  const comment = String(
    rowLookup(column, 'comment', 'Comment') ?? column.comment ?? '',
  );

  return {
    name,
    type,
    attribute: normalizeAttribute(attributeRaw),
    use_case,
    expr,
    comment,
  };
}

/** Row shape from Form.List — spread `...restField` onto nested Form.Items so `isListField` registers correctly. */
type SchemaColumnListRow = FormListFieldData & {
  isListField?: boolean;
  fieldKey?: number;
};

export interface AddSchemaTableProps extends TableProps<SchemaColumnListRow> {
  initialValues?: SchemaColumnRow[];
  name?: string;
  formValidation: FormRule;
  config?: {
    defaultEditFields?: boolean;
    defaultAddColumns?: boolean;
    defaultRemoveColumns?: boolean;
  };
}

const defaultEmptyRow = (): z.infer<typeof rowSchema> => ({
  name: '',
  type: '',
  attribute: [],
  use_case: '',
  expr: '',
  comment: '',
});

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
  const form = Form.useFormInstance();

  useLayoutEffect(() => {
    if (!initialValues.length) {
      return;
    }
    form.setFieldsValue({
      [name]: initialValues.map((col) => listItemFromPartial(col)),
    });
  }, [form, name, initialValues]);

  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => {
        const handleAddColumn = () => {
          add(defaultEmptyRow());
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
            render: (_: unknown, record: SchemaColumnListRow) => {
              return config.defaultRemoveColumns ? (
                <Tooltip title="Remove Column" destroyOnHidden>
                  <Button
                    icon={<IconTrash />}
                    size="small"
                    shape="circle"
                    type="default"
                    onClick={() => remove(record.name)}
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
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item
                  {...restField}
                  name={[rowIndex, 'name']}
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
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item
                  {...restField}
                  name={[rowIndex, 'type']}
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
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item
                  {...restField}
                  name={[rowIndex, 'use_case']}
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
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item
                  {...restField}
                  name={[rowIndex, 'attribute']}
                  rules={[formValidation]}
                >
                  <InlineEditSelect
                    mode="multiple"
                    options={ATTRIBUTE_OPTIONS}
                  />
                </Form.Item>
              );
            },
          },
          {
            title: 'Expression',
            dataIndex: 'expr',
            key: 'expr',
            width: '16%',
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item
                  {...restField}
                  name={[rowIndex, 'expr']}
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
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item
                  {...restField}
                  name={[rowIndex, 'comment']}
                  rules={[formValidation]}
                >
                  <InlineEditInput />
                </Form.Item>
              );
            },
          },
        ];

        return (
          <Table<SchemaColumnListRow>
            dataSource={fields}
            rowKey="key"
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
      }}
    </Form.List>
  );
};
