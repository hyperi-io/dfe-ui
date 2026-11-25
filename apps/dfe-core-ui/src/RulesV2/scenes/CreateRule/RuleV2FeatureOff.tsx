'use client';

import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
  DEFAULT_ESTIMATE_COST,
} from '@/core/components/CreateUpdateRuleForm';

import { useCreateRule } from '@/core/hooks/useCreateRule';

export const RuleV2FeatureOff = () => {
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
      source_type: 'raw',
      estimate_cost: values.estimate_cost ?? DEFAULT_ESTIMATE_COST,
      cost_window_minutes: values.cost_window_minutes
        ? Number(values.cost_window_minutes)
        : 0,
    });
  };
  return (
    <>
      <CreateUpdateRuleForm
        onFinish={handleCreateCustomRule}
        isPending={isPending}
        error={createRuleError}
        hideAdvancedSettings
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
        <CreateUpdateRuleForm.ResponseModal
          response={createRuleResponse}
          onClose={resetCreateRule}
        />
      )}
      {createRuleResponse != null && (
        <CreateUpdateRuleForm.ResponseModal onClose={resetCreateRule} />
      )}
    </>
  );
};
