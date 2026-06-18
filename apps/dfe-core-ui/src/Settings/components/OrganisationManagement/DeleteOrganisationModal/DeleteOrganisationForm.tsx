import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  org_name: z.string().min(1, { message: 'Organisation Name is required' }),
});
export type DeleteOrganisationFormData = z.infer<typeof formSchema>;

export const DeleteOrganisationForm = ({
  org_name,
  onFinish,
  error,
  isPending,
  onCancel,
}: {
  org_name: string;
  onFinish: (values: DeleteOrganisationFormData) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<DeleteOrganisationFormData>();
  const formValidation =
    useAntdZodResolver<DeleteOrganisationFormData>(formSchema);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = (values: DeleteOrganisationFormData) => {
    if (values.org_name !== org_name) {
      setFormError('Organisation ID does not match');
      return;
    }
    onFinish(values);
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish}>
        <p>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{org_name}</span>?
        </p>

        <Form.Item name="org_name" rules={[formValidation]}>
          <Input placeholder="Enter organisation ID to be deleted" />
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
