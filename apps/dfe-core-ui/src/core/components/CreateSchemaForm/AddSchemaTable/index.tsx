import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { UploadedSchemaRow } from '@/core/components/CreateSchemaForm/types';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { SchemaTable } from '@/core/components/SchemaTable';
import { TableProps } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { Tooltip } from '@/core/components/Tooltip';
import { useFetchSchemaVocabulary } from '@/core/hooks/useFetchSchemaVocabulary';
import {
  attributeOptions,
  cardinalityOptions,
  currentUseCaseName,
  indexOptionsFor,
  primitiveOptions,
  suitsPrimitive,
} from '@/core/hooks/useFetchSchemaVocabulary/options';
import { rowSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import type { ValidatorRule } from '@rc-component/form/lib/interface';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, FormRule, Input } from 'antd';

import type { FormListFieldData } from 'antd/es/form';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  type ComponentProps,
} from 'react';
import z from 'zod';
import {
  foldRetiredAttributes,
  listItemFromPartial,
} from './AddSchemaTable.helpers';
import { TypeOverrideSelect } from './TypeOverrideSelect';

export type RowSchema = z.infer<typeof rowSchema>;

/** A column that declares no cardinality shows the one the engine reads it as. */
const CardinalitySelect = ({
  value,
  fallbackValue,
  ...props
}: ComponentProps<typeof InlineEditSelect> & { fallbackValue?: string }) => (
  <InlineEditSelect {...props} value={value || fallbackValue} />
);

/** Stable default so layout effect does not treat a new `[]` each render as an update. */
const EMPTY_COLUMNS: UploadedSchemaRow[] = [];

/** Row shape from Form.List — spread `...restField` onto nested Form.Items so `isListField` registers correctly. */
type SchemaColumnListRow = FormListFieldData & {
  isListField?: boolean;
  fieldKey?: number;
};

/* import-scope-drift-disable - (exported for tests) */
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
/* import-scope-drift-enable */

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

const AT_LEAST_ONE_SCHEMA_ROW_MESSAGE =
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
  const {
    data: vocabulary,
    error: vocabularyError,
    isLoading: isLoadingVocabulary,
  } = useFetchSchemaVocabulary();
  // A select with no options yet says it is loading, not that there is no data.
  const loadingSelect = {
    loading: isLoadingVocabulary,
    notFoundContent: isLoadingVocabulary ? 'Loading...' : undefined,
  };
  const typeOptions = useMemo(
    () => (vocabulary ? primitiveOptions(vocabulary) : []),
    [vocabulary],
  );
  const cardinalitySelectOptions = useMemo(
    () => (vocabulary ? cardinalityOptions(vocabulary) : []),
    [vocabulary],
  );
  const columnAttributeOptions = useMemo(
    () => (vocabulary ? attributeOptions(vocabulary) : []),
    [vocabulary],
  );

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

  // Once the engine says what a retired attribute or use case name means, a row that holds one
  // reads as its replacement. The rows are edited in place, because writing the whole list
  // again would remount them and drop an edit in progress.
  useEffect(() => {
    if (!vocabulary) {
      return;
    }
    const rows = (form.getFieldValue(name) ?? []) as RowSchema[];
    rows.forEach((row, index) => {
      const folded = foldRetiredAttributes(
        row.cardinality,
        row.attribute ?? [],
        vocabulary.cardinality.retired_attributes,
      );
      if (folded.cardinality !== row.cardinality) {
        form.setFieldValue([name, index, 'cardinality'], folded.cardinality);
        form.setFieldValue([name, index, 'attribute'], folded.attribute);
      }
      const useCase = row.use_case
        ? currentUseCaseName(vocabulary, row.use_case)
        : row.use_case;
      if (useCase !== row.use_case) {
        form.setFieldValue([name, index, 'use_case'], useCase);
      }
    });
  }, [form, name, vocabulary, initialValuesSignature]);

  useEffect(() => {
    onMount?.();
  }, [onMount]);

  return (
    <>
      {vocabularyError && (
        <FormNotification
          type="error"
          text={`The column types could not be loaded: ${vocabularyError.message}`}
        />
      )}
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
              title: <p>Name (required)</p>,
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
              title: <p>Type (required)</p>,
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
                          event &&
                          typeof event === 'object' &&
                          'target' in event
                            ? (event as { target: { value: unknown } }).target
                                .value
                            : event;
                        form.setFieldValue(
                          [name, rowIndex, 'ch_override'],
                          undefined,
                        );
                        // An index that does not suit the new type would be refused by the engine.
                        const useCasePath = [name, rowIndex, 'use_case'];
                        const useCase = form.getFieldValue(useCasePath);
                        if (
                          vocabulary &&
                          useCase &&
                          !suitsPrimitive(vocabulary, useCase, String(nextType))
                        ) {
                          form.setFieldValue(useCasePath, '');
                        }
                        return nextType;
                      }}
                    >
                      <InlineEditSelect
                        {...loadingSelect}
                        options={typeOptions}
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
                  <Form.Item noStyle dependencies={[[name, rowIndex, 'type']]}>
                    {() => (
                      <Form.Item
                        {...restField}
                        name={[rowIndex, 'use_case']}
                        rules={[formValidation]}
                      >
                        <InlineEditSelect
                          {...loadingSelect}
                          options={
                            vocabulary
                              ? indexOptionsFor(
                                  vocabulary,
                                  form.getFieldValue([name, rowIndex, 'type']),
                                )
                              : []
                          }
                          defaultEditing={
                            Array.isArray(config.defaultEditFields) &&
                            config.defaultEditFields.includes('use_case')
                          }
                        />
                      </Form.Item>
                    )}
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
                      {...loadingSelect}
                      mode="multiple"
                      options={columnAttributeOptions}
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
              title: 'Cardinality',
              dataIndex: 'cardinality',
              key: 'cardinality',
              width: 180,
              render: (_: unknown, record: SchemaColumnListRow) => {
                const { key: _rowKey, name: rowIndex, ...restField } = record;
                return (
                  <Form.Item
                    {...restField}
                    name={[rowIndex, 'cardinality']}
                    rules={[formValidation]}
                  >
                    <CardinalitySelect
                      {...loadingSelect}
                      fallbackValue={vocabulary?.cardinality.default}
                      options={cardinalitySelectOptions}
                      defaultEditing={
                        Array.isArray(config.defaultEditFields) &&
                        config.defaultEditFields.includes('cardinality')
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
    </>
  );
};
