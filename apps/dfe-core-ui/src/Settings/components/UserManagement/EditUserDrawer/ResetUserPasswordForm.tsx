import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useAccountResetPassword } from '@/Settings/hooks/useAccountResetPassword';
import { App, Button, Input } from 'antd';
import z from 'zod';

const formSchema = z.object({
  new_password: z.string().min(1, { message: 'New password is required' }),
});

type ResetUserPasswordFormValues = z.infer<typeof formSchema>;

export const ResetUserPasswordForm = ({ username }: { username: string }) => {
  const [form] = Form.useForm<ResetUserPasswordFormValues>();
  const formValidation =
    useAntdZodResolver<ResetUserPasswordFormValues>(formSchema);
  const { notification } = App.useApp();

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
    },
  });

  const handleFinish = (values: ResetUserPasswordFormValues) => {
    resetPassword(values);
  };

  return (
    <Form
      name={`reset-user-password-form-${username}`}
      form={form}
      onFinish={handleFinish}
      layout="vertical"
    >
      <Form.Item
        name="new_password"
        label="New password"
        rules={[formValidation]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      {error && (
        <Form.Item>
          <FormNotification type="error" text={error.message} />
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
