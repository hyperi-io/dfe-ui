import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { AccountGroupSelect } from '@/Settings/components/UserManagement/AccountGroupSelect';
import { useFetchAccountDetail } from '@/Settings/hooks/useFetchAccountDetail';
import { AccountUpdateRequestBody } from '@/Settings/hooks/useUpdateAccount/types';
import { Button, Spin } from 'antd';
import z from 'zod';

const formSchema = z.object({
  groups: z.array(z.string()).optional(),
});

type UpdateUserFormValues = z.infer<typeof formSchema>;

export const UpdateUserForm = ({
  username,
  onFinish,
  error,
  isPending,
}: {
  username: string;
  onFinish: (values: AccountUpdateRequestBody) => void;
  error: Error | null;
  isPending: boolean;
}) => {
  const [form] = Form.useForm<UpdateUserFormValues>();
  const formValidation = useAntdZodResolver<UpdateUserFormValues>(formSchema);

  const {
    data: accountDetail,
    isLoading,
    error: fetchError,
  } = useFetchAccountDetail({ username });

  const handleFinish = (values: UpdateUserFormValues) => {
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
        title="Error fetching user detail"
        description={fetchError.message}
      />
    );
  }

  if (!accountDetail) {
    return null;
  }

  return (
    <Form
      name={`update-user-form-${username}`}
      form={form}
      onFinish={handleFinish}
      initialValues={{ groups: accountDetail.groups }}
    >
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
          Update User
        </Button>
      </Form.Item>
    </Form>
  );
};
