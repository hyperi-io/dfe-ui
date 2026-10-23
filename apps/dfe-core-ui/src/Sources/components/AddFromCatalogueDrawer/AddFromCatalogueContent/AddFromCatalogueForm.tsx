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
import { IconChevronLeft } from '@repo/dfe-icons';
import { Button, FormProps } from 'antd';
import type { FormListFieldData } from 'antd/es/form';
import { ColumnsType } from 'antd/es/table';
import z from 'zod';
import { INTAKE_OPTIONS, INTAKE_OPTIONS_MAP } from './constants';

const controlSchema = {
  intakeOptions: z.array(z.string()).optional(),
};

const formSchema = z.object({
  entry: z.string().min(1),
  name: sourceNameValidator,
  intake: z.enum(['beats', 'fetcher', 'receiver']),
  transform: z.string().min(1),
  transport: z.enum(['bus', 'direct']),
  archive: z.boolean(),
  ...controlSchema,
});

export type AddFromCatalogueFormValues = z.infer<typeof formSchema>;
type AddFromCatalogueFormStore = {
  entries: AddFromCatalogueFormValues[];
};
interface AddFromCatalogueFormProps extends Omit<
  FormProps<AddFromCatalogueFormStore>,
  'initialValues' | 'onFinish'
> {
  onCancel?: () => void;
  initialValues: AddFromCatalogueFormValues[];
  onFinish?: (entries: AddFromCatalogueFormValues[]) => void;
  error?: Error | null;
  isPending?: boolean;
}

export const AddFromCatalogueForm = ({
  initialValues,
  onCancel,
  onFinish,
  error,
  isPending,
  ...props
}: AddFromCatalogueFormProps) => {
  const { componentHeight } = useSetComponentHeight({ offset: 300 });

  const [form] = Form.useForm<AddFromCatalogueFormStore>();
  const formValidation = useAntdZodResolver(formSchema);
  const transportOptions = Object.entries(SOURCE_TRANSPORT_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const handleFinish = (values: AddFromCatalogueFormStore) => {
    onFinish?.(values.entries);
  };

  return (
    <Form
      {...props}
      className="flex flex-col gap-2"
      form={form}
      onFinish={handleFinish}
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
        {(fields) => {
          const columns: ColumnsType<FormListFieldData> = [
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
              render: (_value, record) => {
                const { key: _rowKey, name: rowIndex, ...restField } = record;
                return (
                  <Form.Item
                    {...restField}
                    name={[rowIndex, 'name']}
                    rules={[formValidation]}
                  >
                    <InlineEditInput defaultEditing={false} />
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
                  <Form.Item {...restField} name={[rowIndex, 'intake']}>
                    <InlineEditSelect
                      defaultEditing={false}
                      options={intakeOptions}
                    />
                  </Form.Item>
                );
              },
            },
            {
              title: 'Transform',
              key: 'transform',
              render: (_value, record) => {
                const { key: _rowKey, name: rowIndex, ...restField } = record;
                return (
                  <Form.Item {...restField} name={[rowIndex, 'transform']}>
                    <InlineEditInput editable={false} defaultEditing={false} />
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
                      defaultEditing={false}
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
