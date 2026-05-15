import { Form } from '@/core/components/Form';
import { Table, TableProps } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, FormRule, Input, Tooltip } from 'antd';
import type { FormListFieldData } from 'antd/es/form';
import { useEffect, useLayoutEffect } from 'react';
import z from 'zod';
import { listItemFromPartial } from './AddSchemaTable.helpers';
import {
  ATTRIBUTE_OPTIONS,
  PRIMITIVE_OPTIONS,
  USE_CASE_OPTIONS,
} from './fieldOptions.constants';
import { SchemaColumnRow } from './types';

const NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
export const rowSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => NAME_REGEX.test(v), {
      message: 'Name must be a valid identifier',
    }),
  type: z.string().min(1, { message: 'Type is required' }),
  attribute: z.array(z.string()).optional(),
  use_case: z.string().optional(),
  expr: z.string().optional(),
  comment: z.string().optional(),
  /** Used for form control of uploaded schema */
  id: z.string(),
  imported: z.boolean().optional(),
});
export type RowSchema = z.infer<typeof rowSchema>;

/** Stable default so layout effect does not treat a new `[]` each render as an update. */
const EMPTY_COLUMNS: SchemaColumnRow[] = [];

/** Row shape from Form.List — spread `...restField` onto nested Form.Items so `isListField` registers correctly. */
type SchemaColumnListRow = FormListFieldData & {
  isListField?: boolean;
  fieldKey?: number;
};

export interface AddSchemaTableProps extends TableProps<SchemaColumnListRow> {
  initialValues?: SchemaColumnRow[];
  /** When the list is empty, clear this Form.List field (default leaves the form store unchanged). */
  resetListWhenEmpty?: boolean;
  name?: string;
  formValidation: FormRule;
  config?: {
    defaultEditFields?: boolean | (keyof RowSchema)[];
    defaultAddColumns?: boolean;
    defaultRemoveColumns?: boolean;
  };
  onMount?: () => void;
}

const defaultEmptyRow = (): z.infer<typeof rowSchema> => ({
  id: '',
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
  resetListWhenEmpty = false,
  formValidation,
  config = {
    defaultEditFields: true,
    defaultAddColumns: true,
    defaultRemoveColumns: true,
  },
  onMount,
  ...tableProps
}: AddSchemaTableProps) => {
  const form = Form.useFormInstance();

  /** New array refs from parents (e.g. `.map(...)`) must not retrigger a sync unless content changed. */
  const initialValuesSignature = JSON.stringify(initialValues);

  useLayoutEffect(() => {
    if (!initialValues.length) {
      if (resetListWhenEmpty) {
        form.setFieldsValue({ [name]: [] });
      }
      return;
    }
    form.setFieldsValue({
      [name]: initialValues.map((col) => listItemFromPartial(col)),
    });
    // Omit `initialValues` from deps: parents often pass a new array each render (e.g. `.map()`); `initialValuesSignature` gates sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when serialized content changes
  }, [form, name, initialValuesSignature, resetListWhenEmpty]);

  useEffect(() => {
    onMount?.();
  }, [onMount]);

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
          /** Ant Design Form only persists fields registered via Form.Item — `id` must be stored for Form.List merges and promotion. */
          {
            title: '',
            key: '__rowId',
            width: 0,
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item {...restField} name={[rowIndex, 'id']} hidden>
                  <Input type="hidden" />
                </Form.Item>
              );
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
                  <InlineEditInput
                    defaultEditing={
                      config.defaultEditFields === true ||
                      (Array.isArray(config.defaultEditFields) &&
                        config.defaultEditFields.includes('name'))
                    }
                  />
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
                    defaultEditing={
                      config.defaultEditFields === true ||
                      (Array.isArray(config.defaultEditFields) &&
                        config.defaultEditFields.includes('type'))
                    }
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
                  <InlineEditSelect
                    options={USE_CASE_OPTIONS}
                    defaultEditing={
                      Array.isArray(config.defaultEditFields) &&
                      config.defaultEditFields.includes('use_case')
                    }
                  />
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
                    defaultEditing={
                      Array.isArray(config.defaultEditFields) &&
                      config.defaultEditFields.includes('attribute')
                    }
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
                  <InlineEditInput
                    defaultEditing={
                      Array.isArray(config.defaultEditFields) &&
                      config.defaultEditFields.includes('expr')
                    }
                  />
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
                  <InlineEditInput
                    defaultEditing={
                      Array.isArray(config.defaultEditFields) &&
                      config.defaultEditFields.includes('comment')
                    }
                  />
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
