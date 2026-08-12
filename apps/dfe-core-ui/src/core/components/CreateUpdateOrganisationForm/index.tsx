import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DB_NAME_REGEX } from '@/core/validationSchemas/CreateSchemaForm/utils';
import { Button, Input } from 'antd';
import z from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => DB_NAME_REGEX.test(v), {
      message:
        'Name must contain only letters, numbers, underscores, and hyphens',
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
          label="Name"
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
        label="Display Name"
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
          <OrganisationSelect
            mode="multiple"
            placeholder="Select organisation IDs"
            currentOrganisation={initialValues?.name}
          />
        </Form.Item>
      )}

      {error && (
        <FormNotification
          type="error"
          text={error.message ?? 'An unexpected error occurred'}
        />
      )}

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
