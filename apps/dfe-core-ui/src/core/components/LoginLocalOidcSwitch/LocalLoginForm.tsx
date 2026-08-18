import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useLogin } from '@/core/hooks/useLogin';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import z from 'zod';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
type FormData = z.infer<typeof formSchema>;

export const LocalLoginForm = ({ callbackUrl }: { callbackUrl: string }) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const {
    mutate: login,
    isPending,
    error,
    reset: resetLoginMutation,
  } = useLogin({ callbackUrl });

  const onSubmit = (data: FormData) => {
    login(data);
  };

  return (
    <Form
      initialValues={{ username: '', password: '' }}
      form={form}
      onFinish={onSubmit}
      onValuesChange={() => {
        resetLoginMutation();
      }}
    >
      <Form.Item name="username" label="Username" rules={[formValidation]}>
        <Input placeholder="Username" />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[formValidation]}>
        <Input.Password placeholder="Password" />
      </Form.Item>

      {error && (
        <FormNotification
          text="Unable to login. Please try again."
          type="error"
        />
      )}
      <Button
        loading={isPending}
        type="primary"
        htmlType="submit"
        className="ml-auto"
      >
        Login
      </Button>
    </Form>
  );
};
