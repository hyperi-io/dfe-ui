import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
});

export type DeleteAccountFormData = z.infer<typeof formSchema>;

export const DeleteAccountForm = ({
  username,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  username: string;
  onFinish: (values: DeleteAccountFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeleteAccountFormData>();
  const formValidation = useAntdZodResolver<DeleteAccountFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeleteAccountFormData) => {
    if (values.username !== username) {
      setFormError('Username does not match');
      return;
    }
    onFinish(values);
  };

  return (
    <Form form={form} onFinish={handleFinish}>
      <p>
        Are you sure you want to delete{' '}
        <span className="font-semibold">{username}</span>?
      </p>

      <Form.Item name="username" rules={[formValidation]}>
        <Input placeholder="Enter username to be deleted" />
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
  );
};
