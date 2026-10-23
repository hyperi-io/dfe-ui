import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { SOURCE_TRANSPORT_LABELS } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
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
  name: z.string().min(1),
  intake: z.string().min(1),
  transform: z.string().min(1),
  transport: z.string().min(1),
  archive: z.boolean().optional(),
  ...controlSchema,
});

export type AddFromCatalogueFormValues = z.infer<typeof formSchema>;
interface AddFromCatalogueFormProps extends FormProps<AddFromCatalogueFormValues> {
  onCancel?: () => void;
  initialValues: AddFromCatalogueFormValues[];
}

export const AddFromCatalogueForm = ({
  initialValues,
  onCancel,
  ...props
}: AddFromCatalogueFormProps) => {
  const { componentHeight } = useSetComponentHeight({ offset: 300 });

  const [form] = Form.useForm();
  const formValidation = useAntdZodResolver(formSchema);
  const transportOptions = Object.entries(SOURCE_TRANSPORT_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  return (
    <div className="flex flex-col gap-2">
      <NotificationCard
        type="info"
        title={
          <span className="flex items-center gap-2">
            <Button
              className="p-0"
              icon={<IconChevronLeft />}
              onClick={onCancel}
              type="text"
            >
              Back
            </Button>
            {initialValues?.length ?? 0} entries selected
          </span>
        }
        action={
          <Button type="primary" onClick={onCancel}>
            Upload Catalogues
          </Button>
        }
      />

      <Form form={form} {...props} initialValues={{ entries: initialValues }}>
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
                      <InlineEditInput
                        editable={false}
                        defaultEditing={false}
                      />
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
                      <InlineEditInput
                        editable={false}
                        defaultEditing={false}
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
    </div>
  );
};
