import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DB_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { Button, Input, Select } from 'antd';
import z from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => DB_NAME_VALIDATOR.regex.test(v), {
      message: DB_NAME_VALIDATOR.message('Name'),
    }),
  display_name: z.string().min(1, { message: 'Display name is required' }),
  org_ids: z.array(z.string()).optional(),
});

export type CreateUpdateOrganisationFormData = z.infer<typeof formSchema>;

export const CreateUpdateOrganisationForm = ({
  initialValues,
  onFinish,
  hasReset = false,
  buttonLabel = 'Save',
  isPending = false,
  error,
  disabledFields,
  hiddenFields,
}: {
  initialValues?: Partial<CreateUpdateOrganisationFormData>;
  onFinish: (values: CreateUpdateOrganisationFormData) => void;
  hasReset?: boolean;
  buttonLabel?: string;
  isPending?: boolean;
  error?: Error | null;
  disabledFields?: {
    name?: boolean;
  };
  hiddenFields?: {
    org_ids?: boolean;
  };
}) => {
  const [form] = Form.useForm<CreateUpdateOrganisationFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateOrganisationFormData>(formSchema);

  const handleFinish = (values: CreateUpdateOrganisationFormData) => {
    onFinish?.(values);
  };

  return (
    <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
      <div className="flex gap-2">
        <Form.Item
          className="flex-1"
          name="name"
          label={<Form.Label required>Name</Form.Label>}
          rules={[formValidation]}
          normalize={(value) =>
            typeof value === 'string' ? value.toLowerCase() : value
          }
        >
          <Input disabled={disabledFields?.name} placeholder="Enter name" />
        </Form.Item>
      </div>

      <Form.Item
        name="display_name"
        label={<Form.Label required>Display Name</Form.Label>}
        rules={[formValidation]}
      >
        <Input placeholder="Enter display name" />
      </Form.Item>
      {!hiddenFields?.org_ids && (
        <Form.Item
          name="org_ids"
          label="Organisation IDs"
          rules={[formValidation]}
        >
          {/* Tenant IDs matched against the data's _org_id values - free
              entry, NOT a pick-an-organisation control. */}
          <Select
            mode="tags"
            placeholder="Enter organisation IDs (matches _org_id in data)"
            tokenSeparators={[',', ' ']}
            open={false}
            suffixIcon={null}
          />
        </Form.Item>
      )}

      {error && <ApiErrorNotification error={error} />}

      <Form.Item className="flex justify-end">
        {hasReset && (
          <Button className="mr-2" type="default" htmlType="reset">
            Reset Form
          </Button>
        )}
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
