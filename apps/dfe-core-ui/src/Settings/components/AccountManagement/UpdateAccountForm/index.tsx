import { AccountGroupSelect } from '@/core/components/AccountGroupSelect';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useFetchAccountDetail } from '@/Settings/hooks/accounts/useFetchAccountDetail';
import { TAccountUpdateRequestBody } from '@/Settings/hooks/accounts/useUpdateAccount/types';
import { Button, Input, Spin } from 'antd';
import z from 'zod';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  groups: z.array(z.string()).optional(),
  email: z.email({ message: 'Valid email is required' }),
  phone: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
});

type UpdateAccountFormValues = z.infer<typeof formSchema>;

export const UpdateAccountForm = ({
  username,
  onFinish,
  error,
  isPending,
}: {
  username: string;
  onFinish: (values: TAccountUpdateRequestBody) => void;
  error: Error | null;
  isPending: boolean;
}) => {
  const [form] = Form.useForm<UpdateAccountFormValues>();
  const formValidation =
    useAntdZodResolver<UpdateAccountFormValues>(formSchema);

  const {
    data: accountDetail,
    isLoading,
    error: fetchError,
  } = useFetchAccountDetail({ username });

  const handleFinish = (values: UpdateAccountFormValues) => {
    onFinish({
      groups: values.groups ?? [],
    });
  };

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {username} details</p>
      </>
    );
  }

  if (fetchError) {
    return (
      <GenericErrorCard
        title="Error fetching account detail"
        description={fetchError.message}
      />
    );
  }

  if (!accountDetail) {
    return null;
  }

  return (
    <Form
      name={`update-account-form-${username}`}
      form={form}
      onFinish={handleFinish}
      initialValues={{ ...accountDetail }}
    >
      <Form.Item name="email" label="Email" rules={[formValidation]}>
        <Input type="email" placeholder="Enter email" />
      </Form.Item>

      <Form.Item name="name" label="Name" rules={[formValidation]}>
        <Input placeholder="Enter name" />
      </Form.Item>

      <Form.Item name="phone" label="Phone" rules={[formValidation]}>
        <Input placeholder="Enter phone" />
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
          Update Account
        </Button>
      </Form.Item>
    </Form>
  );
};
