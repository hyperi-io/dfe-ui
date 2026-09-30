import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { cn } from '@/core/utils/style';
import { newPasswordSchema } from '@/core/validationSchemas/password.schema';
import { Button, FormProps, Input } from 'antd';
import type { ReactNode } from 'react';
import z from 'zod';

/** The engine's answer when the current password given with a self change is wrong. */
export const INVALID_CURRENT_PASSWORD_CODE = 'invalid_current_password';

const CURRENT_PASSWORD_REFUSED = 'That is not your current password.';

const newPasswords = z.object({
  new_password: newPasswordSchema,
  confirm_password: newPasswordSchema,
});
const passwordsMatch = {
  check: (data: { new_password: string; confirm_password: string }) =>
    data.new_password === data.confirm_password,
  params: { path: ['confirm_password'], message: 'Passwords do not match' },
};

const formSchema = newPasswords.refine(
  passwordsMatch.check,
  passwordsMatch.params,
);
const withCurrentSchema = newPasswords
  .extend({
    current_password: z
      .string()
      .min(1, { message: 'Enter your current password' }),
  })
  .refine(passwordsMatch.check, passwordsMatch.params);

export type TResetPasswordFormValues = z.infer<typeof formSchema> & {
  current_password?: string;
};

interface ResetPasswordFormProps extends FormProps<TResetPasswordFormValues> {
  error?: Error | null;
  isPending?: boolean;
  submitText?: string;
  /** Rendered at the start of the action row, opposite the submit button. */
  secondaryAction?: ReactNode;
  /** An account changing its own password proves the current one as well. */
  askCurrentPassword?: boolean;
}
export const ResetPasswordForm = ({
  id = 'reset-password-form',
  onFinish,
  error,
  isPending,
  submitText = 'Reset Password',
  secondaryAction,
  askCurrentPassword = false,
  ...formProps
}: ResetPasswordFormProps) => {
  const [form] = Form.useForm<TResetPasswordFormValues>();
  const formValidation = useAntdZodResolver<TResetPasswordFormValues>(
    askCurrentPassword ? withCurrentSchema : formSchema,
  );
  const currentRefused =
    askCurrentPassword &&
    getApiErrorResponseBody(error)?.code === INVALID_CURRENT_PASSWORD_CODE;

  const handleFinish = (values: TResetPasswordFormValues) => {
    onFinish?.(values);
  };
  return (
    <Form
      id={id}
      form={form}
      onFinish={handleFinish}
      initialValues={{
        ...(askCurrentPassword ? { current_password: '' } : {}),
        new_password: '',
        confirm_password: '',
      }}
      {...formProps}
    >
      {askCurrentPassword && (
        <Form.Item
          name="current_password"
          label="Current Password"
          rules={[formValidation]}
          {...(currentRefused
            ? { validateStatus: 'error', help: CURRENT_PASSWORD_REFUSED }
            : {})}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
      )}
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

      <ApiErrorNotification error={currentRefused ? null : error} />

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
