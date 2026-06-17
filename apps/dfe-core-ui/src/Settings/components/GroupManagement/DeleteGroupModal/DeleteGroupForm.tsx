import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  group_name: z.string().min(1, { message: 'Group name is required' }),
});

export type DeleteGroupFormData = z.infer<typeof formSchema>;

export const DeleteGroupForm = ({
  group_name,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  group_name: string;
  onFinish: (values: DeleteGroupFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeleteGroupFormData>();
  const formValidation = useAntdZodResolver<DeleteGroupFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeleteGroupFormData) => {
    if (values.group_name !== group_name) {
      setFormError('Group name does not match');
      return;
    }
    onFinish(values);
  };

  return (
    <Form form={form} onFinish={handleFinish}>
      <p>
        Are you sure you want to delete{' '}
        <span className="font-semibold">{group_name}</span>?
      </p>

      <Form.Item name="group_name" rules={[formValidation]}>
        <Input placeholder="Enter group name to be deleted" />
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
