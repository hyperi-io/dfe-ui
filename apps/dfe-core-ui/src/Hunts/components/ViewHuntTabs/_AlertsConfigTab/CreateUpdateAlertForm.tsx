import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DESTINATION_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { Button, Input, Switch } from 'antd';
import z from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => DESTINATION_NAME_VALIDATOR.regex.test(v), {
      message: DESTINATION_NAME_VALIDATOR.message('Name'),
    }),
  url: z.string().min(1, { message: 'URL is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  enabled: z.boolean(),
});
export type EditAlertCardFormData = z.infer<typeof formSchema>;

export const CreateUpdateAlertForm = ({
  onFinish,
  initialValues,
  isPending,
  error,
  buttonLabel = 'Save',
}: {
  onFinish: (values: EditAlertCardFormData) => void;
  initialValues?: EditAlertCardFormData;
  isPending?: boolean;
  error?: Error | null;
  buttonLabel?: string;
}) => {
  const [form] = Form.useForm<EditAlertCardFormData>();
  const formValidation = useAntdZodResolver<EditAlertCardFormData>(formSchema);

  return (
    <Form
      name="edit-alert-card"
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item label="Name" name="name" rules={[formValidation]}>
        <Input />
      </Form.Item>
      <Form.Item label="URL" name="url" rules={[formValidation]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[formValidation]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Enabled" name="enabled" rules={[formValidation]}>
        <Switch />
      </Form.Item>
      {error && <FormNotification type="error" text={error.message} />}
      <Form.Item className="flex justify-end">
        <Button
          loading={isPending}
          disabled={isPending}
          htmlType="submit"
          type="primary"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
