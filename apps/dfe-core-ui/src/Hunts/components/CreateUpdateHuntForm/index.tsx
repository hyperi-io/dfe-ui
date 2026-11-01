import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { SourceSelect } from '@/core/components/SourceSelect';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { CRONBuilderDrawer } from '@/Hunts/components/CRONBuilderDrawer';
import { IconDeviceFloppy, IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, FormProps, Input } from 'antd';
import { useEffect, useMemo } from 'react';
import z from 'zod';
import { RuleSelect } from './RuleSelect';

/** The engine's code for a hunt naming an organisation it does not hold, such as a deleted one. */
export const UNKNOWN_ORG_CODE = 'unknown_org';

const requiredName = z
  .string({ message: 'Name is required' })
  .min(1, { message: 'Name is required' });

// The engine checks the name on create only, so an existing hunt's locked name stays unchecked.
const newName = requiredName.refine(
  (v) => RULE_HUNT_NAME_VALIDATOR.regex.test(v),
  { message: RULE_HUNT_NAME_VALIDATOR.message('Name') },
);

const buildFormSchema = (nameIsNew: boolean) =>
  z.object({
    name: nameIsNew ? newName : requiredName,
    display_name: z.string().optional().nullable(),
    global_target_table_name: z.string().optional().nullable(),
    global_source_table_name: z
      .string({ message: 'Global source table name is required' })
      .min(1, { message: 'Global source table name is required' }),
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
      .array(
        z
          .string({ message: 'Cron is required' })
          .min(1, { message: 'Cron is required' }),
      )
      .min(1, { message: 'Cron is required' }),
    log_buffer: z
      .number({ message: 'Log buffer is required' })
      .min(1, { message: 'Log buffer is required' }),
  });
export type CreateUpdateHuntFormData = z.infer<
  ReturnType<typeof buildFormSchema>
>;

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
  const formSchema = useMemo(
    () => buildFormSchema(!disabledFields?.name),
    [disabledFields?.name],
  );
  const formValidation =
    useAntdZodResolver<CreateUpdateHuntFormData>(formSchema);

  const handleFinish = (values: CreateUpdateHuntFormData) => {
    onFinish(values);
  };

  const unknownOrg = getApiErrorResponseBody(error)?.code === UNKNOWN_ORG_CODE;

  useEffect(() => {
    const refusal = getApiErrorResponseBody(error);
    if (refusal?.code === UNKNOWN_ORG_CODE) {
      form.setFields([{ name: 'customers', errors: [refusal.message] }]);
    }
  }, [error, form]);

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
      <Form.Item
        name="global_source_table_name"
        label="Source Table"
        rules={[formValidation]}
      >
        <SourceSelect placeholder="Select source" />
      </Form.Item>
      <Form.Item
        name="global_target_table_name"
        label="Target Table"
        extra="Leave blank to write detections to the default detection table."
        rules={[formValidation]}
      >
        <Input placeholder="Optional" />
      </Form.Item>
      <Form.Item name="rules" label="Rules" rules={[formValidation]}>
        <RuleSelect mode="multiple" placeholder="Select rules" />
      </Form.Item>

      <Form.List name="cron">
        {(fields, { add, remove }, { errors }) => (
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <span>
                <span className="text-error">* </span>
                {fields.length > 1 ? 'Cron Expressions' : 'Cron Expression'}
              </span>
              <Button
                size="small"
                aria-label="Add cron expression"
                shape="circle"
                icon={<IconPlus />}
                type="default"
                onClick={() => add('')}
              />
            </div>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key} className="flex gap-2">
                <Form.Item
                  {...restField}
                  name={name}
                  className="w-full"
                  rules={[formValidation]}
                >
                  <CRONBuilderDrawer
                    aria-label="Cron expression"
                    placeholder="Enter expression"
                  />
                </Form.Item>
                <Button
                  aria-label={`Remove cron expression ${index + 1}`}
                  icon={<IconTrash />}
                  size="small"
                  shape="circle"
                  type="default"
                  disabled={fields.length === 1}
                  className="hover:border-error hover:text-error mt-xs"
                  onClick={() => remove(name)}
                />
              </div>
            ))}
            {errors.length > 0 && <Form.ErrorList errors={errors} />}
          </div>
        )}
      </Form.List>

      {error && !unknownOrg && <ApiErrorNotification error={error} />}

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
