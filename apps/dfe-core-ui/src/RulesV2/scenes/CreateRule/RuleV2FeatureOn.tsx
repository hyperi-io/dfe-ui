'use client';

import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/core/components/CreateUpdateRuleFormV2';
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
