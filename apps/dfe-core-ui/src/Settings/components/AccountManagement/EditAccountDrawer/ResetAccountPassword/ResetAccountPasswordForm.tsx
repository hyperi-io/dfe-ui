import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { App, Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  new_password: z.string().min(1, { message: 'New password is required' }),
  confirm_password: z
    .string()
    .min(1, { message: 'Confirm password is required' }),
});

type ResetAccountPasswordFormValues = z.infer<typeof formSchema>;

export const ResetAccountPasswordForm = ({
  username,
  onSuccess,
}: {
  username: string;
  onSuccess?: () => void;
}) => {
  const [form] = Form.useForm<ResetAccountPasswordFormValues>();
  const formValidation =
    useAntdZodResolver<ResetAccountPasswordFormValues>(formSchema);
  const { notification } = App.useApp();
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const {
    mutate: resetPassword,
    isPending,
    error,
  } = useAccountResetPassword({
    username,
    onSuccess: () => {
      form.resetFields();
      notification.success({
        title: 'Password reset successfully',
        placement: 'bottomLeft',
      });
      onSuccess?.();
    },
  });

  const handleFinish = (values: ResetAccountPasswordFormValues) => {
    if (values.new_password !== values.confirm_password) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    resetPassword(values);
  };

  return (
    <Form
      name={`reset-account-password-form-${username}`}
      form={form}
      onFinish={handleFinish}
      layout="vertical"
      onValuesChange={() => {
        setConfirmPasswordError(null);
      }}
    >
      <Form.Item
        name="new_password"
        label={<Form.Label required>New password</Form.Label>}
        rules={[formValidation]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      <Form.Item
        name="confirm_password"
        label={<Form.Label required>Confirm password</Form.Label>}
        rules={[formValidation]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      {error && (
        <Form.Item>
          <FormNotification type="error" text={error.message} />
        </Form.Item>
      )}

      {confirmPasswordError && (
        <Form.Item>
          <FormNotification type="error" text={confirmPasswordError} />
        </Form.Item>
      )}

      <Form.Item className="mb-0 flex justify-end">
        <Button
          loading={isPending}
          disabled={isPending}
          type="default"
          htmlType="submit"
        >
          Reset Password
        </Button>
      </Form.Item>
    </Form>
  );
};
