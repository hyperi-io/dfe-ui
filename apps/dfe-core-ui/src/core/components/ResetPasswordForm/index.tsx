import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, FormProps, Input } from 'antd';
import z from 'zod';

const formSchema = z
  .object({
    new_password: z
      .string()
      .min(12, 'Password must contain at least 12 characters'),
    confirm_password: z
      .string()
      .min(12, 'Password must contain at least 12 characters'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });
export type TResetPasswordFormValues = z.infer<typeof formSchema>;

interface ResetPasswordFormProps extends FormProps<TResetPasswordFormValues> {
  error?: Error | null;
  isPending?: boolean;
  submitText?: string;
}
export const ResetPasswordForm = ({
  id = 'reset-password-form',
  onFinish,
  error,
  isPending,
  submitText = 'Reset Password',
  ...formProps
}: ResetPasswordFormProps) => {
  const [form] = Form.useForm<TResetPasswordFormValues>();
  const formValidation = useAntdZodResolver(formSchema);

  const handleFinish = (values: TResetPasswordFormValues) => {
    onFinish?.(values);
  };
  return (
    <Form
      id={id}
      form={form}
      onFinish={handleFinish}
      initialValues={{
        new_password: '',
        confirm_password: '',
      }}
      {...formProps}
    >
      <Form.Item
        name="new_password"
        label="New Password"
        rules={[formValidation]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="confirm_password"
        label="Confirm Password"
        rules={[formValidation]}
      >
        <Input.Password />
      </Form.Item>

      {error && <FormNotification type="error" text={error.message} />}

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={isPending}>
          {submitText}
        </Button>
      </div>
    </Form>
  );
};
