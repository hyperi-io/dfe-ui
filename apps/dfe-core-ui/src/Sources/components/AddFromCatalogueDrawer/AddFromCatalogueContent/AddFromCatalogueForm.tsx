import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { SOURCE_TRANSPORT_LABELS } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { sourceNameValidator } from '@/Sources/utils/validation';
import { IconChevronLeft, IconTrash } from '@repo/dfe-icons';
import { Button, FormProps } from 'antd';
import type { FormListFieldData } from 'antd/es/form';
import { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import z from 'zod';
import { INTAKE_OPTIONS, INTAKE_OPTIONS_MAP } from './constants';

const formSchema = z.object({
  entry: z.string().min(1),
  name: sourceNameValidator,
  intake: z.enum(['beats', 'fetcher', 'receiver']),
  transport: z.enum(['bus', 'direct']),
  archive: z.boolean(),
});

/** `intakeOptions` chooses the intake select. It is not a request field. */
export type AddFromCatalogueFormValues = z.infer<typeof formSchema> & {
  intakeOptions?: string[] | null;
};

/** The list the field rules check, so an issue path is `entries`, the row, then the cell. */
const storeSchema = z.object({
  entries: z.array(formSchema),
});

type AddFromCatalogueFormStore = z.infer<typeof storeSchema>;

/** Cells a person can change. The catalogue entry stays a label. */
const EDITABLE_FIELDS = ['name', 'intake', 'transport'] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

const isEditableField = (field: PropertyKey): field is EditableField =>
  typeof field === 'string' &&
  (EDITABLE_FIELDS as readonly string[]).includes(field);

/** The editable cells a row's schema issues land on, the ones the table opens. */
const editableIssues = (
  result: ReturnType<typeof formSchema.safeParse>,
): EditableField[] => {
  if (result.success) return [];
  const fields = new Set<EditableField>();
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field !== undefined && isEditableField(field)) fields.add(field);
  }
  return [...fields];
};

interface AddFromCatalogueFormProps extends Omit<
  FormProps<AddFromCatalogueFormStore>,
  'initialValues' | 'onFinish'
> {
  onCancel?: () => void;
  initialValues: AddFromCatalogueFormValues[];
  onFinish?: (entries: AddFromCatalogueFormValues[]) => void;
  onSelectedEntriesChange?: (entries: AddFromCatalogueFormValues[]) => void;
  error?: Error | null;
  isPending?: boolean;
}

export const AddFromCatalogueForm = ({
  initialValues,
  onCancel,
  onFinish,
  onSelectedEntriesChange,
  error,
  isPending,
  ...props
}: AddFromCatalogueFormProps) => {
  const { componentHeight } = useSetComponentHeight({ offset: 300 });

  const [form] = Form.useForm<AddFromCatalogueFormStore>();
  const formValidation = useAntdZodResolver(storeSchema);
  const [editingFields, setEditingFields] = useState<EditableField[][]>([]);
  const transportOptions = Object.entries(SOURCE_TRANSPORT_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const fieldEditing = (rowIndex: number, field: EditableField) =>
    editingFields[rowIndex]?.includes(field) ?? false;

  /**
   * Archive and the intake list are not cells, so a submit value is laid over
   * the row that was selected before the schema sees it.
   */
  const rowsForParse = (
    submitted: Partial<AddFromCatalogueFormValues>[] | undefined,
  ) =>
    (submitted ?? []).map((entry, index) => ({
      ...initialValues[index],
      ...entry,
    }));

  const rejectInvalidRows = (
    submitted: Partial<AddFromCatalogueFormValues>[] | undefined,
  ) => {
    const results = rowsForParse(submitted).map((entry) =>
      formSchema.safeParse(entry),
    );
    const parsed: AddFromCatalogueFormValues[] = [];
    for (const result of results) {
      if (!result.success) {
        setEditingFields(results.map(editableIssues));
        void form.validateFields().catch(() => undefined);
        return null;
      }
      parsed.push(result.data);
    }
    return parsed;
  };

  const handleFinish = (values: AddFromCatalogueFormStore) => {
    const parsed = rejectInvalidRows(values.entries);
    if (!parsed) return;
    onFinish?.(parsed);
  };

  return (
    <Form
      {...props}
      className="flex flex-col gap-2"
      form={form}
      onFinish={handleFinish}
      onFinishFailed={() => {
        rejectInvalidRows(form.getFieldsValue(true).entries);
      }}
      initialValues={{ entries: initialValues }}
    >
      <NotificationCard
        type="info"
        title={
          <span className="flex items-center gap-2">
            <Button
              className="p-0"
              icon={<IconChevronLeft />}
              onClick={onCancel}
              type="text"
              disabled={isPending}
            >
              Back
            </Button>
            {initialValues?.length ?? 0} entries selected
          </span>
        }
        action={
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            disabled={isPending}
          >
            Upload Catalogues
          </Button>
        }
      />

      {error && <ApiErrorNotification error={error} />}

      <Form.List name="entries">
        {(fields, { remove }) => {
          const columns: ColumnsType<FormListFieldData> = [
            {
              key: 'action',
              width: 40,
              render: (_value, record) => {
                const { key: _rowKey, name: rowIndex } = record;
                return (
                  <Button
                    icon={<IconTrash />}
                    aria-label={`Remove ${initialValues[rowIndex].entry}`}
                    shape="circle"
                    size="small"
                    onClick={() => {
                      remove(rowIndex);
                      onSelectedEntriesChange?.(
                        initialValues.filter((_, index) => index !== rowIndex),
                      );
                    }}
                  />
                );
              },
            },
            {
              title: 'Catalogue Entry',
              key: 'entry',
              render: (_value, record) => {
                const { key: _rowKey, name: rowIndex, ...restField } = record;
                return (
                  <Form.Item {...restField} name={[rowIndex, 'entry']}>
                    <InlineEditInput editable={false} defaultEditing={false} />
                  </Form.Item>
                );
              },
            },
            {
              title: 'Source Name',
              dataIndex: 'name',
              key: 'name',
              width: '30%',
              render: (_value, record) => {
                const { key: _rowKey, name: rowIndex, ...restField } = record;
                return (
                  <Form.Item
                    {...restField}
                    name={[rowIndex, 'name']}
                    rules={[formValidation]}
                    className=""
                  >
                    <InlineEditInput
                      key={fieldEditing(rowIndex, 'name') ? 'editing' : 'view'}
                      allowClear={false}
                      className="max-w-48"
                      defaultEditing={fieldEditing(rowIndex, 'name')}
                    />
                  </Form.Item>
                );
              },
            },
            {
              title: 'Intake',
              key: 'intake',
              render: (_value, record) => {
                const { key: _rowKey, name: rowIndex, ...restField } = record;

                const intakeOptions =
                  initialValues[rowIndex]?.intakeOptions?.map((option) => ({
                    value: option,
                    label:
                      INTAKE_OPTIONS_MAP[
                        option as keyof typeof INTAKE_OPTIONS_MAP
                      ],
                  })) ?? INTAKE_OPTIONS;
                return (
                  <Form.Item
                    {...restField}
                    name={[rowIndex, 'intake']}
                    rules={[formValidation]}
                  >
                    <InlineEditSelect
                      key={
                        fieldEditing(rowIndex, 'intake') ? 'editing' : 'view'
                      }
                      defaultEditing={fieldEditing(rowIndex, 'intake')}
                      options={intakeOptions}
                    />
                  </Form.Item>
                );
              },
            },
            {
              title: 'Transport',
              dataIndex: 'transport',
              key: 'transport',
              render: (_value, record) => {
                const { key: _rowKey, name: rowIndex, ...restField } = record;

                return (
                  <Form.Item
                    {...restField}
                    name={[rowIndex, 'transport']}
                    rules={[formValidation]}
                  >
                    <InlineEditSelect
                      key={
                        fieldEditing(rowIndex, 'transport') ? 'editing' : 'view'
                      }
                      defaultEditing={fieldEditing(rowIndex, 'transport')}
                      options={transportOptions}
                    />
                  </Form.Item>
                );
              },
            },
          ];
          return (
            <Table
              scroll={{ y: componentHeight, x: 'max-content' }}
              locale={{
                emptyText: (
                  <NotificationCard
                    type="default"
                    title="No entries selected."
                  />
                ),
              }}
              rowKey="name"
              columns={columns}
              dataSource={fields}
            />
          );
        }}
      </Form.List>
    </Form>
  );
};
