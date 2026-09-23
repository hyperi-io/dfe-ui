import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { UploadedSchemaRow } from '@/core/components/CreateSchemaForm/types';
import { Form } from '@/core/components/Form';
import { SchemaTable } from '@/core/components/SchemaTable';
import { TableProps } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { Tooltip } from '@/core/components/Tooltip';
import { rowSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import type { ValidatorRule } from '@rc-component/form/lib/interface';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, FormRule, Input } from 'antd';

import type { FormListFieldData } from 'antd/es/form';
import { useEffect, useLayoutEffect } from 'react';
import z from 'zod';
import { listItemFromPartial } from './AddSchemaTable.helpers';
import {
  ATTRIBUTE_OPTIONS,
  PRIMITIVE_OPTIONS,
  USE_CASE_OPTIONS,
} from './fieldOptions.constants';
import { TypeOverrideSelect } from './TypeOverrideSelect';

export type RowSchema = z.infer<typeof rowSchema>;

/** Stable default so layout effect does not treat a new `[]` each render as an update. */
const EMPTY_COLUMNS: UploadedSchemaRow[] = [];

/** Row shape from Form.List — spread `...restField` onto nested Form.Items so `isListField` registers correctly. */
type SchemaColumnListRow = FormListFieldData & {
  isListField?: boolean;
  fieldKey?: number;
};

export interface AddSchemaTableProps extends TableProps<SchemaColumnListRow> {
  initialValues?: UploadedSchemaRow[];
  /** When the list is empty, clear this Form.List field (default leaves the form store unchanged). */
  resetListWhenEmpty?: boolean;
  /** Require at least one non-blank row before the list passes validation. */
  requireAtLeastOneRow?: boolean;
  name?: string;
  formValidation: FormRule;
  config?: {
    defaultEditFields?: boolean | (keyof RowSchema)[];
    defaultAddColumns?: boolean;
    defaultRemoveColumns?: boolean;
  };
  onMount?: () => void;
  onRemoveRow?: (row: Partial<UploadedSchemaRow> | undefined) => void;
  visibleColumns?: string[];
  lockedColumns?: string[];
}

const defaultEmptyRow = (): z.infer<typeof rowSchema> => ({
  id: '',
  name: '',
  type: '',
  attribute: [],
  use_case: '',
  expr: '',
  comment: '',
  _field_type: SCHEMA_FIELD_TYPES.USER_DEFINED,
});

/** Same shape as {@link defaultEmptyRow} — append-only adds skip preemptive validate.
 * @param row - The row to check.
 * @returns True if the row is a blank schema list row.
 * @example
 * isBlankSchemaListRow({ id: '', name: '', type: '', attribute: [], use_case: '', expr: '', comment: '', _field_type: SCHEMA_FIELD_TYPES.CSV_IMPORT }) // true
 * isBlankSchemaListRow({ id: '1', name: 'test', type: 'string', attribute: ['test'], use_case: 'test', expr: 'test', comment: 'test', _field_type: SCHEMA_FIELD_TYPES.USER_DEFINED }) // false
 */
export const isBlankSchemaListRow = (row: unknown): boolean => {
  if (!row || typeof row !== 'object') return false;
  const r = row as Record<string, unknown>;

  const empty = (v: unknown) => v === '' || v === undefined || v === null;
  const attrs = r.attribute;
  return (
    empty(r.id) &&
    empty(r.name) &&
    empty(r.type) &&
    empty(r.use_case) &&
    empty(r.expr) &&
    empty(r.comment) &&
    (attrs === undefined || (Array.isArray(attrs) && attrs.length === 0))
  );
};

export const AT_LEAST_ONE_SCHEMA_ROW_MESSAGE =
  'At least one schema column is required';

const atLeastOneNonBlankSchemaRowRule = (): ValidatorRule => ({
  validator: async (_, value) => {
    const rows = Array.isArray(value) ? value : [];
    if (!rows.some((row) => !isBlankSchemaListRow(row))) {
      return Promise.reject(new Error(AT_LEAST_ONE_SCHEMA_ROW_MESSAGE));
    }
  },
});

export const AddSchemaTable = ({
  initialValues = EMPTY_COLUMNS,
  name = 'columns',
  resetListWhenEmpty = false,
  requireAtLeastOneRow = true,
  formValidation,
  config = {
    defaultEditFields: true,
    defaultAddColumns: true,
    defaultRemoveColumns: true,
  },
  visibleColumns: visibleColumnsProp,
  lockedColumns: lockedColumnsProp,
  onMount,
  onRemoveRow,
  ...tableProps
}: AddSchemaTableProps) => {
  const visibleColumns = visibleColumnsProp ?? [
    'main_action',
    'name',
    'type',
    '__rowId',
    'expr',
    'comment',
  ];
  const lockedColumns = lockedColumnsProp ?? [
    '_field_type',
    '__rowId',
    'main_action',
    'name',
  ];
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
    <Form.List
      name={name}
      rules={
        requireAtLeastOneRow ? [atLeastOneNonBlankSchemaRowRule()] : undefined
      }
    >
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
            dataIndex: 'main_action',
            key: 'main_action',
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
                    onClick={() => {
                      const rows = (form.getFieldValue(name) ??
                        []) as UploadedSchemaRow[];
                      const rowSnapshot = rows[record.name as number];
                      remove(record.name);
                      onRemoveRow?.(rowSnapshot);
                    }}
                  />
                </Tooltip>
              ) : null;
            },
          },
          {
            title: <Form.Label required>Name</Form.Label>,
            dataIndex: 'name',
            key: 'name',
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <Form.Item
                  {...restField}
                  name={[rowIndex, 'name']}
                  rules={[formValidation]}
                >
                  <InlineEditInput
                    classNames={{
                      editContainer: 'w-full',
                    }}
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
            title: <Form.Label required>Type</Form.Label>,
            dataIndex: 'type',
            key: 'type',
            width: 250,
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;

              const typeFormName = [rowIndex, 'type'];
              const chOverrideFormName = [rowIndex, 'ch_override'];
              return (
                <div className="flex items-center gap-2 justify-between w-full">
                  <Form.Item
                    {...restField}
                    name={typeFormName}
                    rules={[formValidation]}
                    getValueFromEvent={(event) => {
                      const nextType =
                        event && typeof event === 'object' && 'target' in event
                          ? (event as { target: { value: unknown } }).target
                              .value
                          : event;
                      form.setFieldValue(
                        [name, rowIndex, 'ch_override'],
                        undefined,
                      );
                      return nextType;
                    }}
                  >
                    <InlineEditSelect
                      options={PRIMITIVE_OPTIONS}
                      classNames={{
                        editContainer: 'w-full min-w-60',
                      }}
                      className="grow w-full"
                      defaultEditing={
                        config.defaultEditFields === true ||
                        (Array.isArray(config.defaultEditFields) &&
                          config.defaultEditFields.includes('type'))
                      }
                    />
                  </Form.Item>

                  <Form.Item {...restField} name={chOverrideFormName}>
                    <TypeOverrideSelect
                      form={form}
                      className="shrink"
                      typeDetails={{
                        type_form_name: [name, ...typeFormName],
                        ch_override_form_name: [name, ...chOverrideFormName],
                      }}
                    />
                  </Form.Item>
                </div>
              );
            },
          },
          {
            title: 'Index Type',
            dataIndex: 'use_case',
            key: 'use_case',
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
            width: 200,
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
            title: 'Expression (CTE)',
            dataIndex: 'expr',
            key: 'expr',
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
          /** Ant Design Form only persists fields registered via Form.Item — `id` / `_field_type` must be stored for list merges and API mapping. */
          {
            title: '',
            key: '__rowId',
            width: 0,
            render: (_: unknown, record: SchemaColumnListRow) => {
              const { key: _rowKey, name: rowIndex, ...restField } = record;
              return (
                <>
                  <Form.Item {...restField} name={[rowIndex, 'id']} hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[rowIndex, '_field_type']}
                    hidden
                  >
                    <Input type="hidden" />
                  </Form.Item>
                </>
              );
            },
          },
        ];

        return (
          <SchemaTable<SchemaColumnListRow>
            visibleColumns={visibleColumns}
            lockedColumns={lockedColumns}
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
