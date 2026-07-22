import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  name_path: z.string().min(1, { message: 'name/path is required' }),
});
export type DeleteVariableFormData = z.infer<typeof formSchema>;

export const DeleteVariableForm = ({
  path,
  name,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  path: string;
  name: string;
  onFinish: (values: DeleteVariableFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeleteVariableFormData>();
  const formValidation = useAntdZodResolver<DeleteVariableFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeleteVariableFormData) => {
    if (values.name_path !== `${name}/${path}`) {
      setFormError('Variable path does not match');
      return;
    }
    onFinish(values);
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">
            {name}/{path}
          </span>
          ?
        </p>

        <Form.Item name="name_path" rules={[formValidation]}>
          <Input placeholder="Enter name/path to be deleted" />
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
