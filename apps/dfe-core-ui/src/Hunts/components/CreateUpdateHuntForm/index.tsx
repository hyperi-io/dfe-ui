import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { SourceSelect } from '@/core/components/SourceSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps, Input } from 'antd';
import z from 'zod';
import { RuleSelect } from './RuleSelect';

const NAME_REGEX = /^[a-z][a-z0-9_]*$/;

const formSchema = z.object({
  name: z
    .string({ message: 'Identifier is required' })
    .min(1, { message: 'Identifier is required' })
    .refine((v) => NAME_REGEX.test(v), {
      message:
        'Identifier must contain only lowercase letters, numbers, and underscores',
    }),
  display_name: z.string().optional().nullable(),
  global_target_table_name: z
    .string({ message: 'Global target table name is required' })
    .min(1, { message: 'Global target table name is required' }),
  customers: z
    .array(z.string({ message: 'Customer is required' }))
    .min(1, { message: 'Customers are required' }),
  rules: z
    .array(
      z
        .string({ message: 'Rule is required' })
        .min(1, { message: 'Rule is required' }),
    )
    .min(1, { message: 'Rules are required' }),
  cron: z
    .string({ message: 'Cron is required' })
    .min(1, { message: 'Cron is required' }),
  log_buffer: z
    .number({ message: 'Log buffer is required' })
    .min(1, { message: 'Log buffer is required' }),
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
      <Form.Item
        name="name"
        label={<Form.Label required>Name</Form.Label>}
        rules={[formValidation]}
      >
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
        label={<Form.Label required>Organisations</Form.Label>}
        rules={[formValidation]}
      >
        <OrganisationSelect
          mode="multiple"
          placeholder="Select organisations"
        />
      </Form.Item>
      <Form.Item
        name="global_source_table_name"
        label={<Form.Label required>Source Table</Form.Label>}
        rules={[formValidation]}
      >
        <SourceSelect placeholder="Select source" />
      </Form.Item>
      <Form.Item
        name="global_target_table_name"
        label={<Form.Label required>Target Table</Form.Label>}
        rules={[formValidation]}
      >
        <Input placeholder="Enter target table" />
      </Form.Item>
      <Form.Item
        name="rules"
        label={<Form.Label required>Rules</Form.Label>}
        rules={[formValidation]}
      >
        <RuleSelect mode="multiple" placeholder="Select rules" />
      </Form.Item>

      <Form.Item
        name="cron"
        label={<Form.Label required>Cron</Form.Label>}
        rules={[formValidation]}
      >
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
