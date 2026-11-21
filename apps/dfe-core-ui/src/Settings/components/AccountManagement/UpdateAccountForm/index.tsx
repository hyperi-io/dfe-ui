import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { AccountDetailFields } from '@/core/components/AccountFields';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { accountNameSchema } from '@/core/validationSchemas/accountName.schema';
import { useFetchAccountDetail } from '@/Settings/hooks/accounts/useFetchAccountDetail';
import { TAccountUpdateRequestBody } from '@/Settings/hooks/accounts/useUpdateAccount/types';
import { Button, Spin } from 'antd';
import { type ReactNode, useMemo } from 'react';
import z from 'zod';

const buildFormSchema = (nameRequired: boolean) =>
  z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    email: z.email({ message: 'Valid email is required' }),
    phone: z.string().optional().nullable(),
    name: accountNameSchema(nameRequired),
  });

type UpdateAccountFormValues = z.infer<ReturnType<typeof buildFormSchema>>;

export const UpdateAccountForm = ({
  actions,
  username,
  onFinish,
  error,
  isPending,
}: {
  /** Buttons shown beside Update Account, such as Reset Password. */
  actions?: ReactNode;
  username: string;
  onFinish: (values: TAccountUpdateRequestBody) => void;
  error: Error | null;
  isPending: boolean;
}) => {
  const [form] = Form.useForm<UpdateAccountFormValues>();
  const {
    data: accountDetail,
    isLoading,
    error: fetchError,
  } = useFetchAccountDetail({ username });
  const nameRequired = Boolean(accountDetail?.name?.trim());
  const formSchema = useMemo(
    () => buildFormSchema(nameRequired),
    [nameRequired],
  );
  const formValidation =
    useAntdZodResolver<UpdateAccountFormValues>(formSchema);

  // Groups and the organisation are set on the Organisation tab, on their own. The username is shown, never sent.
  const handleFinish = ({
    username: _username,
    ...values
  }: UpdateAccountFormValues) => {
    onFinish(values);
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
      <AccountDetailFields isNew={false} rule={formValidation} />

      {error && (
        <Form.Item>
          <FormNotification type="error" text={error.message} />
        </Form.Item>
      )}

      <Form.Item className="flex justify-end">
        <div className="flex gap-2">
          {actions}
          <Button
            loading={isPending}
            disabled={isPending}
            type="primary"
            htmlType="submit"
          >
            Update Account
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};
