import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  action_name: z.string().min(1, { message: 'Action Name is required' }),
});
export type DeleteActionFormData = z.infer<typeof formSchema>;

export const DeleteActionForm = ({
  action_name,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  action_name: string;
  onFinish: (values: DeleteActionFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeleteActionFormData>();
  const formValidation = useAntdZodResolver<DeleteActionFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeleteActionFormData) => {
    if (values.action_name !== action_name) {
      setFormError('Action name does not match');
      return;
    }
    onFinish(values);
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{action_name}</span>?
        </p>

        <Form.Item name="action_name" rules={[formValidation]}>
          <Input placeholder="Enter action name to be deleted" />
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
