import { AccountGroupSelect } from '@/core/components/AccountGroupSelect';
import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { TAccountCreateRequestBody } from '@/core/hooks/useCreateAccount/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { newPasswordSchema } from '@/core/validationSchemas/password.schema';
import { Button, Input } from 'antd';
import z from 'zod';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: newPasswordSchema,
  groups: z.array(z.string()).optional(),
  email: z.email({ message: 'Valid email is required' }),
  phone: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
});

export type CreateAccountFormData = z.infer<typeof formSchema>;

export const CreateAccountForm = ({
  onFinish,
  disabledFields,
  error,
  isPending,
  buttonLabel = 'Create Account',
  initialValues = {
    username: '',
    password: '',
    groups: [],
    email: '',
    phone: '',
    name: '',
  },
}: {
  onFinish: (values: TAccountCreateRequestBody) => void;
  error: Error | null;
  isPending: boolean;
  buttonLabel?: string;
  initialValues?: CreateAccountFormData;
  disabledFields?: {
    groups?: boolean;
  };
}) => {
  const [form] = Form.useForm<CreateAccountFormData>();
  const formValidation = useAntdZodResolver<CreateAccountFormData>(formSchema);

  const handleFinish = (values: CreateAccountFormData) => {
    onFinish({
      username: values.username,
      password: values.password,
      groups: values.groups ?? [],
      email: values.email,
      phone: values.phone ?? '',
      name: values.name ?? values.username,
    });
  };

  return (
    <Form
      name="create-account-form"
      form={form}
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Form.Item
        name="username"
        label={<Form.Label required>Username</Form.Label>}
        rules={[formValidation]}
      >
        <Input placeholder="Enter username" />
      </Form.Item>

      <Form.Item
        name="email"
        label={<Form.Label required>Email</Form.Label>}
        rules={[formValidation]}
      >
        <Input type="email" placeholder="Enter email" />
      </Form.Item>

      <Form.Item
        name="name"
        label={<Form.Label>Name</Form.Label>}
        rules={[formValidation]}
      >
        <Input placeholder="Enter name" />
      </Form.Item>

      <Form.Item
        name="phone"
        label={<Form.Label>Phone</Form.Label>}
        rules={[formValidation]}
      >
        <Input placeholder="Enter phone" />
      </Form.Item>

      <Form.Item
        name="password"
        label={<Form.Label required>Password</Form.Label>}
        rules={[formValidation]}
      >
        <Input.Password
          autoComplete="new-password"
          placeholder="Enter password"
        />
      </Form.Item>

      <Form.Item
        name="groups"
        label={<Form.Label required>Groups</Form.Label>}
        rules={[formValidation]}
      >
        <AccountGroupSelect disabled={disabledFields?.groups} />
      </Form.Item>

      {error && (
        <Form.Item>
          <ApiErrorNotification error={error} />
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
