import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  policy_name: z.string().min(1, { message: 'Policy Name is required' }),
});
export type DeletePolicyFormData = z.infer<typeof formSchema>;

export const DeletePolicyForm = ({
  policy_name,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  policy_name: string;
  onFinish: (values: DeletePolicyFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeletePolicyFormData>();
  const formValidation = useAntdZodResolver<DeletePolicyFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeletePolicyFormData) => {
    if (values.policy_name !== policy_name) {
      setFormError('Policy name does not match');
      return;
    }
    onFinish(values);
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{policy_name}</span>?
        </p>

        <Form.Item name="policy_name" rules={[formValidation]}>
          <Input placeholder="Enter policy name to be deleted" />
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
