import { GenericErrorCard } from '@/core/components/GenericError';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/Rules/components/CreateUpdateRuleForm';
import { RuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { useUpdateRule } from '@/Rules/hooks/useUpdateRule';
import { RuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { useQueryClient } from '@tanstack/react-query';
import { Spin } from 'antd';

interface UpdateRuleFormProps {
  rule: RuleDetail;
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
        queryKey: ['rule', rule.rule_id],
      });
      onSuccess?.(response);
    },
    rule_id: rule.rule_id,
  });

  const handleUpdateRule = (values: CreateUpdateRuleFormData) => {
    updateRule({
      ...values,
      source_type: '',
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
        key={rule.rule_id ?? 'empty'}
        disabledFields={{
          name: true,
        }}
        initialValues={{
          name: rule.name,
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
