import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { AccountGroupSelect } from '@/Settings/components/AccountManagement/AccountGroupSelect';
import { AccountCreateRequestBody } from '@/Settings/hooks/useCreateAccount/types';
import { Button, Input } from 'antd';
import z from 'zod';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  groups: z.array(z.string()).optional(),
});

export type CreateAccountFormData = z.infer<typeof formSchema>;

export const CreateAccountForm = ({
  onFinish,
  error,
  isPending,
  buttonLabel = 'Create Account',
}: {
  onFinish: (values: AccountCreateRequestBody) => void;
  error: Error | null;
  isPending: boolean;
  buttonLabel?: string;
}) => {
  const [form] = Form.useForm<CreateAccountFormData>();
  const formValidation = useAntdZodResolver<CreateAccountFormData>(formSchema);

  const handleFinish = (values: CreateAccountFormData) => {
    onFinish({
      username: values.username,
      password: values.password,
      groups: values.groups ?? [],
    });
  };

  return (
    <Form
      name="create-account-form"
      form={form}
      onFinish={handleFinish}
      initialValues={{ username: '', password: '', groups: [] }}
    >
      <Form.Item name="username" label="Username" rules={[formValidation]}>
        <Input placeholder="Enter username" />
      </Form.Item>

      <Form.Item name="password" label="Password" rules={[formValidation]}>
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      <Form.Item name="groups" label="Groups" rules={[formValidation]}>
        <AccountGroupSelect />
      </Form.Item>

      {error && (
        <Form.Item>
          <FormNotification type="error" text={error.message} />
        </Form.Item>
      )}

      <Form.Item className="flex justify-end">
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
