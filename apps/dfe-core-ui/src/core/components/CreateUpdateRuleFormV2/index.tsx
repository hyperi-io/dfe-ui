import { AceEditor } from '@/core/components/AceEditor';
import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { ContentCard } from '@/core/components/ContentCard';
import { Form } from '@/core/components/Form';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { TSqlValidationResponse } from '@/core/hooks/useValidateRule/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps } from 'antd';
import { useEffect, useMemo } from 'react';
import z from 'zod';
import { AdvancedSettings } from './AdvancedSettings';
import { DEFAULT_ESTIMATE_COST } from './defaults';
import { ResponseModal } from './ResponseModal';
import { RuleSettings } from './RuleSettings';

const requiredName = z.string().min(1, { message: 'Name is required' });

// The engine checks the name on create only, and the gitops store allows names
// the create endpoint refuses, so an existing rule's locked name stays unchecked.
const newName = requiredName.refine(
  (v) => RULE_HUNT_NAME_VALIDATOR.regex.test(v),
  { message: RULE_HUNT_NAME_VALIDATOR.message('Name') },
);

const buildFormSchema = (nameIsNew: boolean) =>
  z.object({
    name: nameIsNew ? newName : requiredName,
    display_name: z.string().optional().nullable(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    cel_filter: z.string().optional(),
  });
export { DEFAULT_ESTIMATE_COST } from './defaults';

export type CreateUpdateRuleFormData = z.infer<
  ReturnType<typeof buildFormSchema>
>;

export interface DisabledFields {
  name?: boolean;
  id?: boolean;
}

type CreateUpdateRuleFormProps = FormProps<CreateUpdateRuleFormData> & {
  onFinish: (values: CreateUpdateRuleFormData) => void;
  initialValues?: CreateUpdateRuleFormData;
  isPending: boolean;
  error: Error | null;
  resetFormFields?: boolean;
  buttonLabel?: string;
  disabledFields?: DisabledFields;
  hideAdvancedSettings?: boolean;
  onValidateSuccess?: (data: TSqlValidationResponse) => void;
};

const CreateUpdateRuleFormBase = ({
  onFinish,
  initialValues,
  isPending,
  error,
  resetFormFields,
  buttonLabel = 'Save Rule',
  disabledFields,
  hideAdvancedSettings = false,
  ...props
}: CreateUpdateRuleFormProps) => {
  const [form] = Form.useForm<CreateUpdateRuleFormData>();
  const formSchema = useMemo(
    () => buildFormSchema(!disabledFields?.name),
    [disabledFields?.name],
  );
  const formValidation =
    useAntdZodResolver<CreateUpdateRuleFormData>(formSchema);

  const { componentHeight } = useSetComponentHeight({
    offset: 450,
  });

  useEffect(() => {
    if (resetFormFields) {
      form.resetFields();
    }
  }, [resetFormFields, form]);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={{ estimate_cost: DEFAULT_ESTIMATE_COST, ...initialValues }}
      {...props}
    >
      <RuleSettings
        formValidation={formValidation}
        disabledFields={disabledFields}
      >
        {!hideAdvancedSettings && (
          <AdvancedSettings formValidation={formValidation} />
        )}
      </RuleSettings>

      <ContentCard className="flex flex-col gap-y-2">
        <Form.Item
          name="user_sql"
          label="User SQL"
          className="m-0! grow"
          rules={[formValidation]}
        >
          <AceEditor
            value={initialValues?.user_sql}
            height={`${componentHeight}px`}
            mode="sql"
          />
        </Form.Item>

        {error && <ApiErrorNotification error={error} />}

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
      </ContentCard>
    </Form>
  );
};

export const CreateUpdateRuleForm = Object.assign(CreateUpdateRuleFormBase, {
  ResponseModal: ResponseModal,
});
