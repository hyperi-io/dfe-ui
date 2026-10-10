import { AceEditor } from '@/core/components/AceEditor';
import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { ContentCard } from '@/core/components/ContentCard';
import { Form } from '@/core/components/Form';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ValidateButton } from '@/core/components/ValidateButton';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { useValidateRule } from '@/Rules/hooks/useValidateRule';
import { TSqlValidationResponse } from '@/Rules/hooks/useValidateRule/types';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps } from 'antd';
import { useEffect, useMemo } from 'react';
import z from 'zod';
import { AdvancedSettings } from './AdvancedSettings';
import { ResponseModal } from './ResponseModal';
import { RuleSettings } from './RuleSettings';
import { SqlValidationErrors } from './SqlValidationErrors';

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
    user_sql: z.string().min(1, { message: 'User SQL is required' }),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    source_type: z.enum(['raw', 'hyperdx']).optional().nullable(),
    cel_filter: z.string().optional(),
    hunt_name: z.string().optional(),
    source: z.string().optional(),
    estimate_cost: z.boolean().optional(),
    cost_window_minutes: z.string().optional(),
  });
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
  onValidateSuccess,
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
    offset: 370,
  });

  useEffect(() => {
    if (resetFormFields) {
      form.resetFields();
    }
  }, [resetFormFields, form]);

  const {
    data: validateRuleResponse,
    mutate: validateRule,
    isPending: isValidateRulePending = false,
    error: validateRuleError,
    reset: resetValidateRule,
  } = useValidateRule({
    onSuccess: (data) => {
      onValidateSuccess?.(data);
    },
  });

  const userSql = Form.useWatch('user_sql', form);
  const handleValidateRule = () => {
    validateRule({ sql: userSql ?? '' });
  };

  // The engine sets valid only when errors is empty, so a pass has nothing to show.
  const sqlValidationErrors = validateRuleResponse?.valid
    ? []
    : (validateRuleResponse?.errors ?? []);

  useEffect(() => {
    resetValidateRule();
  }, [userSql, resetValidateRule]);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
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

        <SqlValidationErrors errors={sqlValidationErrors} />

        {validateRuleError && (
          <ApiErrorNotification error={validateRuleError} />
        )}

        {error && <ApiErrorNotification error={error} />}

        <div className="flex gap-x-2 ml-auto! mt-2">
          <RbacProtected action={RbacProtected.rbacActions.rule_validate}>
            <RbacProtected.Unrestricted>
              <ValidateButton
                validate={handleValidateRule}
                loading={isValidateRulePending}
                failed={sqlValidationErrors.length > 0 || !!validateRuleError}
                success={validateRuleResponse?.valid}
              />
            </RbacProtected.Unrestricted>
            <RbacProtected.Restricted
              tooltip={{ show: true, placement: 'top' }}
            >
              <Button disabled type="default">
                Validate
              </Button>
            </RbacProtected.Restricted>
          </RbacProtected>

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
