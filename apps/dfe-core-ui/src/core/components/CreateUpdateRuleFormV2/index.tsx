import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { MatchCriteriaInput } from '@/core/components/MatchCriteriaInput';
import { useCheckCel } from '@/core/hooks/useCelCheck';
import { useValidateRule } from '@/core/hooks/useValidateRuleV2';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  MATCH_NESTING_LIMIT,
  MATCH_OPERATORS,
} from '@repo/dfe-engine-types/limits';
import { IconDeviceFloppy } from '@repo/dfe-icons';
import { Button, FormProps, Input, Select, Splitter } from 'antd';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { CriteriaRunPanel, MatchCriteriaField } from './CriteriaRunPanel';
import { DEFAULT_ESTIMATE_COST } from './defaults';
import { ResponseModal } from './ResponseModal';
import {
  buildFormSchema,
  CreateUpdateRuleFormData,
  criteriaIssues,
} from './schema';

export { DEFAULT_ESTIMATE_COST } from './defaults';

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
};

const CreateUpdateRuleFormBase = ({
  onFinish,
  initialValues,
  isPending,
  error,
  resetFormFields,
  buttonLabel = 'Save Rule',
  disabledFields,
  ...props
}: CreateUpdateRuleFormProps) => {
  const [form] = Form.useForm<CreateUpdateRuleFormData>();
  const formSchema = useMemo(
    () => buildFormSchema(!disabledFields?.name),
    [disabledFields?.name],
  );
  const formValidation =
    useAntdZodResolver<CreateUpdateRuleFormData>(formSchema);
  const [matchCriteriaFormName, setMatchCriteriaFormName] =
    useState<MatchCriteriaField>('match');
  const [showCriteriaErrors, setShowCriteriaErrors] = useState(false);
  const watchedMatch = Form.useWatch('match', form);
  const watchedCel = Form.useWatch('cel_filter', form);
  const watchedSql = Form.useWatch('user_sql', form);

  useEffect(() => {
    if (resetFormFields) {
      form.resetFields();
    }
  }, [resetFormFields, form]);

  const operatorOptions = useMemo(
    () =>
      MATCH_OPERATORS.map((operator) => ({
        label: operator,
        value: operator,
      })),
    [],
  );

  const sqlCheck = useValidateRule();
  const celCheck = useCheckCel();
  const validateSql = {
    data: sqlCheck.data
      ? {
          valid: sqlCheck.data.valid,
          errors: (sqlCheck.data.errors ?? []).map((sqlError) => ({
            message: sqlError.message,
            suggestion: sqlError.suggestion ?? '',
          })),
        }
      : null,
    mutate: (sql: string) => sqlCheck.mutate({ sql }),
    isPending: sqlCheck.isPending,
    error: sqlCheck.error,
    reset: sqlCheck.reset,
  };
  const validateCel = {
    data: celCheck.data
      ? { valid: celCheck.data.valid, errors: celCheck.data.errors ?? [] }
      : null,
    mutate: (expression: string) =>
      celCheck.mutate({ expression, check_profile: true }),
    isPending: celCheck.isPending,
    error: celCheck.error,
    reset: celCheck.reset,
  };

  const issues = useMemo(
    () =>
      criteriaIssues(matchCriteriaFormName, {
        match: watchedMatch,
        cel_filter: watchedCel,
        user_sql: watchedSql,
      }),
    [matchCriteriaFormName, watchedMatch, watchedCel, watchedSql],
  );
  const checkFailed =
    (matchCriteriaFormName === 'cel_filter' &&
      !!validateCel.data &&
      !validateCel.data.valid) ||
    (matchCriteriaFormName === 'user_sql' &&
      !!validateSql.data &&
      !validateSql.data.valid);
  const criteriaReady = issues.length === 0 && !checkFailed;

  const handleModeChange = (mode: 'conditions' | 'expression' | 'sql') => {
    switch (mode) {
      case 'conditions':
        setMatchCriteriaFormName('match');
        break;
      case 'expression':
        setMatchCriteriaFormName('cel_filter');
        break;
      case 'sql':
        setMatchCriteriaFormName('user_sql');
        break;
    }
  };

  const criteriaField = (actions?: ReactNode) => (
    <Form.Item
      label="Match Criteria"
      name={matchCriteriaFormName}
      className="mb-0"
    >
      <MatchCriteriaInput
        operatorOptions={operatorOptions}
        matchDepthLimit={MATCH_NESTING_LIMIT}
        validate={{
          cel: validateCel,
          sql: validateSql,
        }}
        actions={actions}
        issues={showCriteriaErrors ? issues : undefined}
        onModeChange={handleModeChange}
      />
    </Form.Item>
  );

  return (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={{ estimate_cost: DEFAULT_ESTIMATE_COST, ...initialValues }}
      {...props}
    >
      <div className="flex gap-x-2">
        <Form.Item
          name="name"
          label="Name"
          className="m-0! grow text-sm w-full"
          layout="vertical"
          rules={[formValidation]}
        >
          <Input disabled={disabledFields?.name} className="w-full" />
        </Form.Item>

        <Form.Item
          name="display_name"
          label="Display Name"
          className="m-0! grow text-sm w-full"
          layout="vertical"
          rules={[formValidation]}
        >
          <Input disabled={disabledFields?.name} className="w-full" />
        </Form.Item>
        <Form.Item
          label="Severity"
          name="severity"
          className="m-0! grow text-sm w-full"
          layout="vertical"
          rules={[formValidation]}
        >
          <Select
            className="w-full"
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Critical', value: 'critical' },
            ]}
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Description"
        name="description"
        className="m-0! grow text-sm w-full"
        layout="vertical"
        rules={[formValidation]}
      >
        <Input.TextArea />
      </Form.Item>

      <CriteriaRunPanel
        field={matchCriteriaFormName}
        criteriaReady={criteriaReady}
        onValidateCriteria={() => setShowCriteriaErrors(true)}
        onRun={() => {
          setShowCriteriaErrors(false);
          validateCel.reset();
          validateSql.reset();
        }}
      >
        {({ actions, results, open }) =>
          open ? (
            <Splitter className="mt-2 h-128">
              <Splitter.Panel defaultSize="58%" min="35%" className="pr-4">
                {criteriaField(actions)}
              </Splitter.Panel>
              <Splitter.Panel min="25%" className="overflow-auto pl-4">
                {results}
              </Splitter.Panel>
            </Splitter>
          ) : (
            criteriaField(actions)
          )
        }
      </CriteriaRunPanel>

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
    </Form>
  );
};

export const CreateUpdateRuleForm = Object.assign(CreateUpdateRuleFormBase, {
  ResponseModal: ResponseModal,
});
