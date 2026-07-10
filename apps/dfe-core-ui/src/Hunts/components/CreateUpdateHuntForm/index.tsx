import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps, Input } from 'antd';
import z from 'zod';
import { OrganisationSelect } from './OrganisationSelect';
import { RuleSelect } from './RuleSelect';

const NAME_REGEX = /^[a-z][a-z0-9_]*$/;

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Identifier is required' })
    .refine((v) => NAME_REGEX.test(v), {
      message:
        'Identifier must contain only lowercase letters, numbers, and underscores',
    }),
  display_name: z.string().optional().nullable(),
  customers: z.array(z.string()).min(1, { message: 'Customers are required' }),
  rules: z
    .array(z.string().min(1, { message: 'Rule is required' }))
    .min(1, { message: 'Rules are required' }),
  cron: z.string().min(1, { message: 'Cron is required' }),
  log_buffer: z.number().min(1, { message: 'Log buffer is required' }),
});
export type CreateUpdateHuntFormData = z.infer<typeof formSchema>;

interface DisabledFields {
  name?: boolean;
}

type CreateUpdateHuntFormProps = FormProps<CreateUpdateHuntFormData> & {
  onFinish: (values: CreateUpdateHuntFormData) => void;
  initialValues?: CreateUpdateHuntFormData;
  isPending: boolean;
  error: Error | null;
  buttonLabel?: string;
  disabledFields?: DisabledFields;
};

export const CreateUpdateHuntForm = ({
  onFinish,
  initialValues,
  isPending,
  error,
  buttonLabel = 'Save Hunt',
  disabledFields,
  ...props
}: CreateUpdateHuntFormProps) => {
  const [form] = Form.useForm<CreateUpdateHuntFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateHuntFormData>(formSchema);

  const handleFinish = (values: CreateUpdateHuntFormData) => {
    onFinish(values);
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      initialValues={initialValues}
      {...props}
    >
      <Form.Item name="name" label="Name" rules={[formValidation]}>
        <Input placeholder="Enter name" disabled={disabledFields?.name} />
      </Form.Item>
      <Form.Item
        name="display_name"
        label="Display Name"
        rules={[formValidation]}
      >
        <Input placeholder="Enter name" />
      </Form.Item>
      <Form.Item
        name="customers"
        label="Organisations"
        rules={[formValidation]}
      >
        <OrganisationSelect
          mode="multiple"
          placeholder="Select organisations"
        />
      </Form.Item>
      <Form.Item name="rules" label="Rules" rules={[formValidation]}>
        <RuleSelect mode="multiple" placeholder="Select rules" />
      </Form.Item>

      <Form.Item name="cron" label="Cron" rules={[formValidation]}>
        <Input placeholder="Enter cron expression" />
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
