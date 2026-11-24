'use client';

import { CreateUpdateRuleForm } from '@/core/components/CreateUpdateRuleFormV2';
import { CreateUpdateRuleFormData } from '@/core/components/CreateUpdateRuleFormV2/schema';
import { toApiRootMatch } from '@/RulesV2/utils/ruleMatch';

import { useCreateRule } from '@/core/hooks/useCreateRuleV2';

export const RuleV2FeatureOn = () => {
  const {
    data: createRuleResponse,
    mutate: createRule,
    reset: resetCreateRule,
    isPending,
    error: createRuleError,
  } = useCreateRule();

  const handleCreateCustomRule = (values: CreateUpdateRuleFormData) => {
    createRule({
      ...values,
      source_type: values.source_type ?? 'raw',
      severity: values.severity ?? 'medium',
      name: values.name ?? '',
      user_sql: values.user_sql ?? '',
      cel_filter: values.cel_filter ?? '',
      match: values.match ? toApiRootMatch(values.match) : values.match,
    });
  };
  return (
    <>
      <CreateUpdateRuleForm
        onFinish={handleCreateCustomRule}
        isPending={isPending}
        error={createRuleError}
        initialValues={{
          name: '',
          user_sql: '',
          severity: 'medium',
          source_type: 'raw',
          cel_filter: '',
          hunt_name: '',
        }}
      />
      {createRuleResponse != null && (
        <CreateUpdateRuleForm.ResponseModal onClose={resetCreateRule} />
      )}
    </>
  );
};
