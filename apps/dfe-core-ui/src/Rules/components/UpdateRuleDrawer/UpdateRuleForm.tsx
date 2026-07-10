import { GenericErrorCard } from '@/core/components/GenericError';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/Rules/components/CreateUpdateRuleForm';
import { RULE_DETAIL_QUERY_KEY } from '@/Rules/hooks/useFetchRuleDetail';
import { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { useUpdateRule } from '@/Rules/hooks/useUpdateRule';
import { RuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { useQueryClient } from '@tanstack/react-query';
import { Spin } from 'antd';

interface UpdateRuleFormProps {
  rule: TRuleDetail;
  onSuccess?: (response: RuleUpdateResponse) => void;
}

export const UpdateRuleForm = ({ rule, onSuccess }: UpdateRuleFormProps) => {
  const queryClient = useQueryClient();

  const {
    mutate: updateRule,
    isPending: isUpdatingRule,
    error: updateRuleError,
    reset: resetUpdateRule,
  } = useUpdateRule({
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: RULE_DETAIL_QUERY_KEY(rule.name),
      });
      onSuccess?.(response);
    },
    name: rule.name,
  });

  const handleUpdateRule = (values: CreateUpdateRuleFormData) => {
    updateRule({
      ...values,
      estimate_cost: values.estimate_cost ?? false,
      cost_window_minutes: values.cost_window_minutes
        ? Number(values.cost_window_minutes)
        : 0,
    });
  };
  if (isUpdatingRule)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (updateRuleError)
    return (
      <GenericErrorCard
        title="Error updating rule"
        description={updateRuleError.message}
      />
    );

  return (
    <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
      <CreateUpdateRuleForm
        key={rule.name ?? 'empty'}
        disabledFields={{
          name: true,
        }}
        initialValues={{
          ...rule,
          user_sql: rule.original_sql,
          severity: rule.severity as 'low' | 'medium' | 'high' | 'critical',
          cel_filter: rule.cel_filter ?? undefined,
          hunt_name: rule.hunt_name ?? undefined,
          source: rule.source ?? undefined,
        }}
        onFinish={handleUpdateRule}
        onValuesChange={resetUpdateRule}
        isPending={isUpdatingRule}
        error={updateRuleError}
        buttonLabel="Update Rule"
      />
    </div>
  );
};
