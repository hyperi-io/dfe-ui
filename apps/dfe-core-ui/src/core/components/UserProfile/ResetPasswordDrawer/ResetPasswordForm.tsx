import { Form } from '@/core/components/Form';
import { useCurrentUserResetPassword } from '@/core/hooks/useCurrentUserResetPassword';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { App, Button, Input } from 'antd';
import z from 'zod';

const formSchema = z
  .object({
    password: z.string().min(1, { message: 'Password is required' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type TResetPasswordForm = z.infer<typeof formSchema>;

export const ResetPasswordForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const { notification } = App.useApp();
  const { mutate: resetPassword } = useCurrentUserResetPassword({
    onSuccess: () => {
      onSuccess?.();
      notification.success({
        title: 'Password reset successfully',
        placement: 'bottomLeft',
      });
    },
  });

  const form = Form.useFormInstance();
  const formValidation = useAntdZodResolver(formSchema);
  const onFinish = (values: TResetPasswordForm) => {
    resetPassword({
      new_password: values.password,
    });
  };
  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item name="password" label="Password" rules={[formValidation]}>
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        rules={[formValidation]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit">
          Reset Password
        </Button>
      </Form.Item>
    </Form>
  );
};
