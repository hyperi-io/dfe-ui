import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolved';
import { sourceNameValidator } from '@/Sources/utils/validation';
import { Button, FormProps, Input, InputNumber, Select, Switch } from 'antd';
import { useEffect } from 'react';
import z from 'zod';

const formSchema = z.object({
  source: sourceNameValidator,
  display_name: z.string().min(1, { message: 'Display name is required' }),
  description: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  'header.type': z.string().nullable().optional(),
  'header.version': z.string().nullable().optional(),
  match: z.string().nullable().optional(),
  'schema.meta_schema': z.string().nullable().optional(),
  'schema.meta_schema_version': z.string().nullable().optional(),
  'schema.derived_schema': z.string().nullable().optional(),
  'schema.additional_fields': z.array(z.string()).nullable().optional(),
  'schema.ttl_days': z.number().nullable().optional(),
  'schema.engine': z.string().nullable().optional(),
  transform: z.boolean().optional(),
  fetcher: z.boolean().optional(),
  sigma: z.string().nullable().optional(),
  mapping_standards: z.array(z.string()).optional(),
});

export type CreateUpdateSourceFormData = z.infer<typeof formSchema>;

type CreateUpdateSourceFormProps = FormProps<CreateUpdateSourceFormData> & {
  onFinish: (values: CreateUpdateSourceFormData) => void;
  isPending: boolean;
  error: Error | null;
  resetFormFields?: boolean;
  buttonLabel?: string;
  disabledFields?: {
    source?: boolean;
    // Add other disabled fields here as necessary
  };
};

export const CreateUpdateSourceForm = ({
  disabledFields,
  initialValues,
  onFinish,
  isPending = false,
  error,
  resetFormFields,
  buttonLabel = 'Save',
  ...props
}: CreateUpdateSourceFormProps) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateSourceFormData>(formSchema);

  useEffect(() => {
    if (resetFormFields) {
      form.resetFields();
    }
  }, [resetFormFields, form]);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      layout="vertical"
      {...props}
    >
      <div className="flex gap-x-2">
        <Form.Item
          className="w-full"
          name="source"
          label="Source"
          rules={[formValidation]}
        >
          <Input disabled={!!disabledFields?.source} />
        </Form.Item>
        <Form.Item name="enabled" label="Enabled" rules={[formValidation]}>
          <Switch />
        </Form.Item>
      </div>

      <Form.Item
        name="display_name"
        label="Display Name"
        rules={[formValidation]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[formValidation]}
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="mapping_standards"
        label="Mapping Standards"
        rules={[formValidation]}
      >
        <Select
          options={[]}
          placeholder="Select mapping standards"
          mode="multiple"
          allowClear
        />
      </Form.Item>

      <SimpleCollapse
        classNames={{
          container: 'pt-0',
          content: 'flex gap-2',
          title: 'font-semibold',
        }}
        title="Header"
        defaultOpen={false}
      >
        <Form.Item
          className="w-full"
          name={['header', 'type']}
          label="Header Type"
          rules={[formValidation]}
        >
          <Select
            options={[
              { label: 'Timeseries', value: 'time_series' },
              { label: 'Minimal', value: 'minimal' },
              { label: 'Passthrough', value: 'passthrough' },
            ]}
            allowClear
          />
        </Form.Item>
        <Form.Item
          className="w-full"
          name={['header', 'version']}
          label="Header Version"
          rules={[formValidation]}
        >
          <Input />
        </Form.Item>
      </SimpleCollapse>

      <SimpleCollapse
        classNames={{
          container: 'pt-0',
          content: 'flex gap-2',
          title: 'font-semibold',
        }}
        title="Match"
        defaultOpen={false}
      >
        <p className="text-sm text-error font-bold">TODO: Match form items</p>
      </SimpleCollapse>

      <SimpleCollapse
        classNames={{
          container: 'pt-0',
          content: 'grid grid-cols-3 gap-2',
          title: 'font-semibold',
        }}
        title="Schema Config"
        defaultOpen={false}
      >
        <Form.Item
          className="w-full"
          name={['schema', 'meta_schema']}
          label="Meta Schema"
          rules={[formValidation]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className="w-full"
          name={['schema', 'meta_schema_version']}
          label="Meta Schema Version"
          rules={[formValidation]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className="w-full"
          name={['schema', 'derived_schema']}
          label="Derived Schema"
          rules={[formValidation]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className="w-full"
          name={['schema', 'additional_fields']}
          label="Additional Fields"
          rules={[formValidation]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          className="w-full"
          name={['schema', 'engine']}
          label="Engine"
          rules={[formValidation]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className="w-full"
          name={['schema', 'ttl_days']}
          label="TTL Days"
          rules={[formValidation]}
        >
          <InputNumber />
        </Form.Item>
      </SimpleCollapse>

      <SimpleCollapse
        classNames={{
          container: 'pt-0',
          content: 'flex gap-2',
          title: 'font-semibold',
        }}
        title="Transform"
        defaultOpen={false}
      >
        <p className="text-sm text-error font-bold">
          TODO: Transform form items
        </p>
      </SimpleCollapse>

      <SimpleCollapse
        classNames={{
          container: 'pt-0',
          content: 'flex gap-2',
          title: 'font-semibold',
        }}
        title="Fetcher"
        defaultOpen={false}
      >
        <p className="text-sm text-error font-bold">TODO: Fetcher form items</p>
      </SimpleCollapse>

      <SimpleCollapse
        classNames={{
          container: 'pt-0',
          content: 'flex gap-2',
          title: 'font-semibold',
        }}
        title="Sigma"
        defaultOpen={false}
      >
        <p className="text-sm text-error font-bold">TODO: Sigma form items</p>
      </SimpleCollapse>

      {error && (
        <Form.Item>
          <FormNotification
            type="error"
            text={error.message ?? 'An unexpected error occurred'}
          />
        </Form.Item>
      )}

      <Form.Item className="flex justify-end">
        <Button className="mr-2" type="default" htmlType="reset">
          Reset Form
        </Button>
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
