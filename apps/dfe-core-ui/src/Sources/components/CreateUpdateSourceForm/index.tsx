import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolved';
import { Button, Form, FormProps, Input, Select, Switch } from 'antd';
import z from 'zod';

const formSchema = z.object({
  source: z.string().min(1, { message: 'Name is required' }),
  display_name: z.string().min(1, { message: 'Display name is required' }),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  header_type: z.enum(['text', 'json']).optional(),
  has_transform: z.boolean().optional(),
  has_fetcher: z.boolean().optional(),
  mapping_standards: z.array(z.string()).optional(),
});

export type CreateUpdateSourceFormData = z.infer<typeof formSchema>;

type CreateUpdateSourceFormProps = FormProps<CreateUpdateSourceFormData> & {
  onFinish: (values: CreateUpdateSourceFormData) => void;
  isPending?: boolean;
  error?: Error;
};

export const CreateUpdateSourceForm = ({
  initialValues,
  onFinish,
  isPending = false,
  error,
  ...props
}: CreateUpdateSourceFormProps) => {
  const [form] = Form.useForm<CreateUpdateSourceFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateSourceFormData>(formSchema);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      layout="vertical"
      {...props}
    >
      <Form.Item
        name="display_name"
        label="Display Name"
        rules={[formValidation]}
      >
        <Input />
      </Form.Item>
      <div className="flex gap-x-2">
        <Form.Item
          className="grow"
          name="source"
          label="Source"
          rules={[formValidation]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          className="min-w-32"
          name="enabled"
          label="Enabled"
          rules={[formValidation]}
        >
          <Switch />
        </Form.Item>
      </div>

      <Form.Item
        name="description"
        label="Description"
        rules={[formValidation]}
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="header_type"
        label="Header Type"
        rules={[formValidation]}
      >
        <Select
          options={[
            { label: 'Text', value: 'text' },
            { label: 'JSON', value: 'json' },
          ]}
          allowClear
        />
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

      <div className="flex gap-x-2">
        <Form.Item
          className="grow"
          name="has_transform"
          label="Has Transform"
          rules={[formValidation]}
          layout="horizontal"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          className="grow"
          name="has_fetcher"
          label="Has Fetcher"
          rules={[formValidation]}
          layout="horizontal"
        >
          <Switch />
        </Form.Item>
      </div>

      {error && (
        <Form.Item>
          <FormNotification
            type="error"
            text={error.message ?? 'An unexpected error occurred'}
          />
        </Form.Item>
      )}

      <Form.Item className="flex justify-end">
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};
