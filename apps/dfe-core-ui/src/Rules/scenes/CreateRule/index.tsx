'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/Rules/components/CreateUpdateRuleForm';
import { useSourceType } from '@/Rules/components/CreateUpdateRuleForm/hooks/useHyperdxSource';
import { useCreateRule } from '@/Rules/hooks/useCreateRule';
import { useFetchSavedSearchFromParams } from '@/Rules/hooks/useFetchSavedSearchFromParams';
import { useHandleIncomingSearchMessage } from '@/Rules/hooks/useHandleIncomingSearchMessage';

export const CreateRuleScene = () => {
  const { search: messageSearch } = useHandleIncomingSearchMessage();
  const { storedSearch, notificationContextHolder } =
    useFetchSavedSearchFromParams({
      search: messageSearch,
    });
  const { sourceType } = useSourceType();

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
      source_type: sourceType,
      estimate_cost: values.estimate_cost ?? false,
      cost_window_minutes: values.cost_window_minutes
        ? Number(values.cost_window_minutes)
        : 0,
    });
  };

  return (
    <>
      {notificationContextHolder}
      <MainContentCard className="p-0">
        <RbacProtected action={RbacProtected.rbacActions.rule_write}>
          <RbacProtected.Unrestricted>
            <CreateUpdateRuleForm
              onFinish={handleCreateCustomRule}
              isPending={isPending}
              error={createRuleError}
              hideAdvancedSettings
              initialValues={{
                name: storedSearch?.savedSearchName ?? '',
                user_sql: storedSearch?.sql ?? '',
                severity: 'medium',
                source_type: sourceType,
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
        </RbacProtected>
      </MainContentCard>
    </>
  );
};
