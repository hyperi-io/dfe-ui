import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  role_name: z
    .string({ message: 'Role Name is required' })
    .min(1, { message: 'Role Name is required' }),
});
export type DeleteRoleFormData = z.infer<typeof formSchema>;

export const DeleteRoleForm = ({
  role_name,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  role_name: string;
  onFinish: (values: DeleteRoleFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeleteRoleFormData>();
  const formValidation = useAntdZodResolver<DeleteRoleFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeleteRoleFormData) => {
    if (values.role_name !== role_name) {
      setFormError('Role name does not match');
      return;
    }
    onFinish(values);
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{role_name}</span>?
        </p>

        <Form.Item name="role_name" rules={[formValidation]}>
          <Input placeholder="Enter role name to be deleted" />
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
