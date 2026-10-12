import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts';
import { Button, Input, Spin } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  oidcProviderName: z
    .string({ message: 'OIDC Provider Name is required' })
    .min(1, { message: 'OIDC Provider Name is required' }),
});
export type DeleteOidcProviderFormData = z.infer<typeof formSchema>;

export const DeleteOidcProviderForm = ({
  oidcProviderName,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  oidcProviderName: string;
  onFinish: (values: DeleteOidcProviderFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeleteOidcProviderFormData>();
  const formValidation =
    useAntdZodResolver<DeleteOidcProviderFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeleteOidcProviderFormData) => {
    if (values.oidcProviderName !== oidcProviderName) {
      setFormError('OIDC Provider Name does not match');
      return;
    }
    onFinish(values);
  };

  const {
    data: { total: accountsCount },
    isLoading: isLoadingAccounts,
  } = useFetchInfiniteFilteredAccounts({
    oidc_id: oidcProviderName,
    blocked: false,
  });

  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{oidcProviderName}</span>?
        </p>

        {isLoadingAccounts && (
          <>
            <Spin />{' '}
            <span className="sr-only">Loading associated accounts...</span>
          </>
        )}

        {accountsCount > 0 && (
          <NotificationCard
            type="error"
            title="This action cannot be undone."
            description={`${accountsCount} accounts are associated with this OIDC Provider. Accounts will be deleted and user access will be revoked.`}
          />
        )}

        <Form.Item name="oidcProviderName" rules={[formValidation]}>
          <Input placeholder="Enter OIDC Provider Name to be deleted" />
        </Form.Item>
        {(error || formError) && (
          <FormNotification text={error?.message || formError} type="error" />
        )}

        <div className="flex w-full justify-end gap-x-2">
          <Button
            loading={isPending || isLoadingAccounts}
            disabled={isPending || isLoadingAccounts}
            type="primary"
            danger
            htmlType="submit"
          >
            Delete
          </Button>
          <Button
            loading={isPending}
            disabled={isPending}
            type="default"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </>
  );
};
