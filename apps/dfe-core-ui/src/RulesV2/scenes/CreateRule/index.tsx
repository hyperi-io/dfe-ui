'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/core/components/CreateUpdateRuleFormV2';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useCreateRule } from '@/core/hooks/useCreateRuleV2';

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
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted tooltip={{ show: true, placement: 'top' }}>
            <RbacProtected.RestrictedRoute />
          </RbacProtected.Restricted>
        </RbacProtected>
      </MainContentCard>
    </>
  );
};
