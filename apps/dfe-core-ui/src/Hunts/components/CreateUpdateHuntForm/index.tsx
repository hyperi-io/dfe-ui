import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps, Input } from 'antd';
import z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
});
export type CreateUpdateHuntFormData = z.infer<typeof formSchema>;

export interface DisabledFields {
  name?: boolean;
  id?: boolean;
}

type CreateUpdateHuntFormProps = FormProps<CreateUpdateHuntFormData> & {
  onFinish: (values: CreateUpdateHuntFormData) => void;
  initialValues?: CreateUpdateHuntFormData;
  isPending: boolean;
  error: Error | null;
  buttonLabel?: string;
};

export const CreateUpdateHuntForm = ({
  onFinish,
  initialValues,
  isPending,
  error,
  buttonLabel = 'Save Hunt',
  ...props
}: CreateUpdateHuntFormProps) => {
  const [form] = Form.useForm<CreateUpdateHuntFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateHuntFormData>(formSchema);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
      {...props}
    >
      <Form.Item name="name" label="Name" rules={[formValidation]}>
        <Input placeholder="Enter name" />
      </Form.Item>
      {error && (
        <FormNotification
          type="error"
          text={error?.message ?? 'An unexpected error occurred'}
        />
      )}

      <div className="flex gap-x-2 ml-auto! mt-2">
        <Button
          loading={isPending}
          htmlType="submit"
          type="primary"
          icon={<IconDeviceFloppy className="size-4" />}
          disabled={isPending}
        >
          {buttonLabel}
        </Button>
      </div>
    </Form>
  );
};
