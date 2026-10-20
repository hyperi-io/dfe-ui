import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/Rules/components/CreateUpdateRuleForm';
import { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { useUpdateRule } from '@/Rules/hooks/useUpdateRule';
import { TRuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { useQueryClient } from '@tanstack/react-query';

interface UpdateRuleFormProps {
  rule: TRuleDetail;
  onSuccess?: (response: TRuleUpdateResponse) => void;
}

export const UpdateRuleForm = ({ rule, onSuccess }: UpdateRuleFormProps) => {
  const queryClient = useQueryClient();

  const { componentHeight } = useSetComponentHeight({
    offset: 125,
  });

  const {
    mutate: updateRule,
    isPending: isUpdatingRule,
    error: updateRuleError,
    reset: resetUpdateRule,
  } = useUpdateRule({
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rules.rule({ name: rule.name }),
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

  return (
    <CustomScrollbar className="flex flex-col gap-4" height={componentHeight}>
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
    </CustomScrollbar>
  );
};
