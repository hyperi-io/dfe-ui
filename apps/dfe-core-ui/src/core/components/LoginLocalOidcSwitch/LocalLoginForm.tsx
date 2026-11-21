import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useLogin } from '@/core/hooks/useLogin';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Checkbox, Input } from 'antd';
import z from 'zod';
import {
  readLoginChoice,
  REMEMBER_LABEL,
  rememberLoginChoice,
} from './loginChoice';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username or email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  remember: z.boolean().default(false),
});
type FormData = z.infer<typeof formSchema>;

/**
 * What the form says about a failed login. NextAuth reports a wrong password
 * as CredentialsSignin, and anything else as the reason the server gave.
 */
export const loginFailureText = (error: Error): string =>
  error.message && error.message !== 'CredentialsSignin'
    ? error.message
    : 'Unable to login. Please try again.';

export const LocalLoginForm = ({
  callbackUrl,
  className,
  rememberable = false,
}: {
  callbackUrl: string;
  className?: string;
  /** Offers to remember local as the sign-in choice, for a page that also offers OIDC. */
  rememberable?: boolean;
}) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const {
    mutate: login,
    isPending,
    error,
    reset: resetLoginMutation,
  } = useLogin({ callbackUrl });

  // The box starts ticked when local is remembered, so logging in unticked forgets it.
  const onSubmit = ({ password, remember, username }: FormData) => {
    if (rememberable) {
      rememberLoginChoice(remember ? { method: 'local' } : null);
    }
    login({ password, username });
  };

  return (
    <Form
      className={cn('w-full', className)}
      initialValues={{
        username: '',
        password: '',
        remember: rememberable && readLoginChoice()?.method === 'local',
      }}
      form={form}
      onFinish={onSubmit}
      onValuesChange={() => {
        resetLoginMutation();
      }}
    >
      <Form.Item
        name="username"
        label="Username or Email"
        rules={[formValidation]}
      >
        <Input placeholder="Username or email" />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[formValidation]}>
        <Input.Password placeholder="Password" />
      </Form.Item>
      {rememberable && (
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>{REMEMBER_LABEL}</Checkbox>
        </Form.Item>
      )}

      {error && (
        <FormNotification text={loginFailureText(error)} type="error" />
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
