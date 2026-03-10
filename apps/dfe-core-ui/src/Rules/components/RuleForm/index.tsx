import { IconDeviceFloppy } from '@hyperi/icons';
import { Button, Form } from 'antd';
import { useEffect } from 'react';

import { useCreateRule } from '@/Rules/hooks/useCreateRule';
import { RuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { useValidateRule } from '@/Rules/hooks/useValidateRule';
import { SqlValidationResponse } from '@/Rules/hooks/useValidateRule/types';
import { AceEditor } from '@/core/components/AceEditor';
import { ContentCard } from '@/core/components/ContentCard';
import { FormNotification } from '@/core/components/FormNotification';
import { ValidateButton } from '@/core/components/ValidateButton';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolved';
import z from 'zod';
import { AdvancedSettings } from './AdvancedSettings';
import { ResponsePopover } from './ResponsePopover';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  user_sql: z.string().min(1, { message: 'User SQL is required' }),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  source_type: z.enum(['raw', 'hyperdx']),
  cel_filter: z.string().optional(),
  hunt_name: z.string().optional(),
  source: z.string().optional(),
  estimate_cost: z.boolean().optional(),
  cost_window_minutes: z.string().optional(),
});
type CreateRuleFormData = z.infer<typeof formSchema>;

interface RuleFormProps {
  initialValues?: CreateRuleFormData;
  className?: string;
  onRuleCreateSuccess?: (response: RuleCreateResponse) => void;
  onRuleValidateSuccess?: (response: SqlValidationResponse) => void;
  disableInputs?: boolean;
}

export const RuleForm = ({
  initialValues,
  className,
  onRuleCreateSuccess,
  onRuleValidateSuccess,
}: RuleFormProps) => {
  const [form] = Form.useForm<CreateRuleFormData>();
  const formValidation = useAntdZodResolver<CreateRuleFormData>(formSchema);

  const { componentHeight } = useSetComponentHeight({
    offset: 300,
  });

  const {
    data: createRuleResponse,
    mutate: createRule,
    reset: resetCreateRule,
    isPending,
    error,
  } = useCreateRule({
    onSuccess: (data) => {
      onRuleCreateSuccess?.(data);
    },
  });

  const {
    data: validateRuleResponse,
    mutate: validateRule,
    isPending: isValidateRulePending = false,
    error: validateRuleError,
    reset: resetValidateRule,
  } = useValidateRule({
    onSuccess: (data) => {
      onRuleValidateSuccess?.(data);
    },
  });

  const handleCreateCustomRule = (values: CreateRuleFormData) => {
    createRule({
      ...values,
      estimate_cost: values.estimate_cost ?? false,
      cost_window_minutes: Number(values.cost_window_minutes) ?? 0,
    });
  };

  const userSql = Form.useWatch('user_sql', form);
  const handleValidateRule = () => {
    validateRule({ sql: userSql ?? '' });
  };

  useEffect(() => {
    resetValidateRule();
  }, [userSql, resetValidateRule]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name ?? '',
        user_sql: initialValues.user_sql ?? '',
        severity: initialValues.severity ?? 'medium',
        source_type: initialValues.source_type ?? 'raw',
        cel_filter: initialValues.cel_filter ?? '',
        hunt_name: initialValues.hunt_name ?? '',
        source: initialValues.source ?? '',
        estimate_cost: initialValues.estimate_cost ?? false,
        cost_window_minutes: initialValues.cost_window_minutes ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  return (
    <>
      <Form
        className={cn('w-full flex flex-col gap-y-2', className)}
        form={form}
        onFinish={handleCreateCustomRule}
        onValuesChange={resetCreateRule}
      >
        <AdvancedSettings formValidation={formValidation} />

        <ContentCard className="flex flex-col gap-y-2">
          <Form.Item
            name="user_sql"
            className="m-0! grow"
            rules={[formValidation]}
          >
            <AceEditor
              value={initialValues?.user_sql}
              height={`${componentHeight}px`}
              name="sql-editor"
              mode="sql"
              // readOnly={!!initialValues?.user_sql}
            />
          </Form.Item>

          {error && (
            <FormNotification
              type="error"
              text={error?.message ?? 'An unexpected error occurred'}
            />
          )}

          <div className="flex gap-x-2 ml-auto! mt-2">
            <ValidateButton
              validate={handleValidateRule}
              loading={isValidateRulePending}
              validationErrors={validateRuleResponse?.errors?.map(
                (error) => error.message,
              )}
              success={validateRuleResponse?.valid}
              error={validateRuleError?.message}
            />

            <Button
              loading={isPending}
              htmlType="submit"
              type="primary"
              icon={<IconDeviceFloppy className="size-4" />}
              disabled={isPending}
            >
              Save Rule
            </Button>
          </div>
        </ContentCard>
      </Form>
      {createRuleResponse != null && (
        <ResponsePopover
          response={createRuleResponse}
          onClose={resetCreateRule}
        />
      )}
    </>
  );
};
