import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps, Input } from 'antd';
import z from 'zod';
import { OrganisationSelect } from './OrganisationSelect';
import { RuleSelect } from './RuleSelect';

const HUNT_ID_REGEX = /^[a-z][a-z0-9_]*$/;

const formSchema = z.object({
  hunt_id: z
    .string()
    .min(1, { message: 'ID is required' })
    .refine((v) => HUNT_ID_REGEX.test(v), {
      message:
        'Identifier must contain only lowercase letters, numbers, and underscores',
    }),
  name: z.string().min(1, { message: 'Display Name is required' }),
  customers: z.array(z.string()).min(1, { message: 'Customers are required' }),
  rules: z
    .array(
      z.object({
        rule_name: z.string().min(1, { message: 'Rule name is required' }),
        target_table_name: z
          .string()
          .min(1, { message: 'Target table name is required' }),
        source: z.string().min(1, { message: 'Source is required' }),
        initial_checkpoint_lookback_minutes: z.number().min(0, {
          message: 'Initial checkpoint lookback minutes is required',
        }),
      }),
    )
    .min(1, { message: 'Rules are required' }),
  cron: z.string().min(1, { message: 'Cron is required' }),
  log_buffer: z.number().min(1, { message: 'Log buffer is required' }),
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
      <Form.Item name="hunt_id" label="Identifier" rules={[formValidation]}>
        <Input placeholder="Enter name" />
      </Form.Item>
      <Form.Item name="name" label="Display Name" rules={[formValidation]}>
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
