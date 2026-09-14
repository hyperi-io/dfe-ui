import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
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

  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{oidcProviderName}</span>?
        </p>

        <Form.Item name="oidcProviderName" rules={[formValidation]}>
          <Input placeholder="Enter OIDC Provider Name to be deleted" />
        </Form.Item>
        {(error || formError) && (
          <FormNotification text={error?.message || formError} type="error" />
        )}

        <div className="flex w-full justify-end gap-x-2">
          <Button
            loading={isPending}
            disabled={isPending}
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
