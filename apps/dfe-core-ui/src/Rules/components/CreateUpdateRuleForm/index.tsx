import { AceEditor } from '@/core/components/AceEditor';
import { ContentCard } from '@/core/components/ContentCard';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ValidateButton } from '@/core/components/ValidateButton';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useValidateRule } from '@/Rules/hooks/useValidateRule';
import { TSqlValidationResponse } from '@/Rules/hooks/useValidateRule/types';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps } from 'antd';
import { useEffect } from 'react';
import z from 'zod';
import { AdvancedSettings } from './AdvancedSettings';
import { ResponseModal } from './ResponseModal';
import { RuleSettings } from './RuleSettings';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
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
export type CreateUpdateRuleFormData = z.infer<typeof formSchema>;

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
          label={<Form.Label required>User SQL</Form.Label>}
          className="m-0! grow"
          rules={[formValidation]}
        >
          <AceEditor
            value={initialValues?.user_sql}
            height={`${componentHeight}px`}
            mode="sql"
          />
        </Form.Item>

        {error && (
          <FormNotification
            type="error"
            text={error?.message ?? 'An unexpected error occurred'}
          />
        )}

        <div className="flex gap-x-2 ml-auto! mt-2">
          <RbacProtected action={RbacProtected.rbacActions.rule_validate}>
            <RbacProtected.Unrestricted>
              <ValidateButton
                validate={handleValidateRule}
                loading={isValidateRulePending}
                validationErrors={validateRuleResponse?.errors?.map(
                  (error) => error.message,
                )}
                success={validateRuleResponse?.valid}
                error={validateRuleError?.message}
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
