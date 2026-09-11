import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { useUpdateCurrentUser } from '@/core/hooks/useUpdateCurrentUser';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { App, Button, Input, Spin } from 'antd';
import z from 'zod';

const formSchema = z.object({
  email: z.email({ message: 'Valid email is required' }),
  phone: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
});

type UpdateCurrentUserFormValues = z.infer<typeof formSchema>;

export const UpdateProfileForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<UpdateCurrentUserFormValues>();
  const formValidation =
    useAntdZodResolver<UpdateCurrentUserFormValues>(formSchema);

  const {
    data: accountDetail,
    isLoading,
    error: fetchError,
  } = useFetchCurrentUser();

  const {
    mutate: updateCurrentUser,
    isPending,
    error,
  } = useUpdateCurrentUser({
    onSuccess: () => {
      notification.success({
        title: 'Profile updated successfully',
        placement: 'bottomLeft',
      });
      onSuccess?.();
    },
  });

  const handleFinish = (values: UpdateCurrentUserFormValues) => {
    updateCurrentUser(values);
  };

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading current user details</p>
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
      name={`update-profile-form`}
      form={form}
      onFinish={handleFinish}
      initialValues={{ ...accountDetail }}
    >
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
          Update Profile
        </Button>
      </Form.Item>
    </Form>
  );
};
