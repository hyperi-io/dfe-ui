import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DB_NAME_REGEX } from '@/core/validationSchemas/CreateSchemaForm/utils';
import { OrganisationSelect } from '@/Settings/components/OrganisationManagement/OrganisationSelect';
import { Button, Checkbox, Input, Switch } from 'antd';
import { useState } from 'react';
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
  dedicated_database: z.boolean(),
  confirm_merge: z.boolean().optional(),
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
  showConfirmMergeField = false,
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
  showConfirmMergeField?: boolean;
}) => {
  const [form] = Form.useForm<CreateUpdateOrganisationFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateOrganisationFormData>(formSchema);

  const [showConfirmMerge, setShowConfirmMerge] = useState(false);
  const confirmMerge = Form.useWatch('confirm_merge', form);

  const isDisablingDedicatedDatabase = (
    values: CreateUpdateOrganisationFormData,
  ) =>
    showConfirmMergeField &&
    initialValues?.dedicated_database === true &&
    values.dedicated_database === false;

  const handleFinish = (values: CreateUpdateOrganisationFormData) => {
    if (isDisablingDedicatedDatabase(values) && !values.confirm_merge) {
      setShowConfirmMerge(true);
      return;
    }
    onFinish?.(values);
  };

  const handleConfirmMerge = () => {
    const values = form.getFieldsValue();
    if (!isDisablingDedicatedDatabase(values) || !values.confirm_merge) {
      return;
    }
    setShowConfirmMerge(false);
    onFinish?.(values);
  };

  const mustConfirmMerge = showConfirmMergeField && showConfirmMerge;
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

        <Form.Item
          name="dedicated_database"
          label="Dedicated DB"
          rules={[formValidation]}
        >
          <Switch />
        </Form.Item>
      </div>

      <Form.Item
        name="display_name"
        label="Display Name"
        rules={[formValidation]}
      >
        <Input placeholder="Enter display name" />
      </Form.Item>
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

      {error && (
        <FormNotification
          type="error"
          text={error.message ?? 'An unexpected error occurred'}
        />
      )}

      {mustConfirmMerge && (
        <NotificationCard
          type="warning"
          description={
            <div className="flex flex-col gap-2 w-full">
              <p>
                You are about to turn off the dedicated ClickHouse database for{' '}
                <span className="font-semibold">
                  {initialValues?.display_name}
                </span>
                .
              </p>
              <p>
                This will remove the dedicated database and manual data
                migration will be required. Are you sure you want to continue?
              </p>
              <Form.Item name="confirm_merge" valuePropName="checked">
                <Checkbox>
                  I acknowledge that this is intentional and that manual data
                  migration will be completed.
                </Checkbox>
              </Form.Item>
              <Button
                className="bg-warning"
                type="primary"
                disabled={!confirmMerge}
                onClick={handleConfirmMerge}
              >
                Confirm Merge
              </Button>
            </div>
          }
        />
      )}

      {!mustConfirmMerge && (
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
      )}
    </Form>
  );
};
