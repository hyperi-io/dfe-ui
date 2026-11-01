'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/Rules/components/CreateUpdateRuleForm';
import { useCreateRule } from '@/Rules/hooks/useCreateRule';

export const CreateRuleScene = () => {
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
      estimate_cost: values.estimate_cost ?? false,
      cost_window_minutes: values.cost_window_minutes
        ? Number(values.cost_window_minutes)
        : 0,
    });
  };

  return (
    <>
      <MainContentCard className="p-0">
        <RbacProtected action={RbacProtected.rbacActions.rule_write}>
          <RbacProtected.Unrestricted>
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
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted tooltip={{ show: true, placement: 'top' }}>
            <RbacProtected.RestrictedRoute />
          </RbacProtected.Restricted>
        </RbacProtected>
      </MainContentCard>
    </>
  );
};
