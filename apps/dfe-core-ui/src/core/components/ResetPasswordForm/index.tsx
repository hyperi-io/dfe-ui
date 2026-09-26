import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { cn } from '@/core/utils/style';
import { newPasswordSchema } from '@/core/validationSchemas/password.schema';
import { Button, FormProps, Input } from 'antd';
import type { ReactNode } from 'react';
import z from 'zod';

const formSchema = z
  .object({
    new_password: newPasswordSchema,
    confirm_password: newPasswordSchema,
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
  /** Rendered at the start of the action row, opposite the submit button. */
  secondaryAction?: ReactNode;
}
export const ResetPasswordForm = ({
  id = 'reset-password-form',
  onFinish,
  error,
  isPending,
  submitText = 'Reset Password',
  secondaryAction,
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
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="confirm_password"
        label="Confirm Password"
        rules={[formValidation]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>

      <ApiErrorNotification error={error} />

      <div
        className={cn(
          'flex items-center',
          secondaryAction ? 'justify-between' : 'justify-end',
        )}
      >
        {secondaryAction}
        <Button type="primary" htmlType="submit" loading={isPending}>
          {submitText}
        </Button>
      </div>
    </Form>
  );
};
