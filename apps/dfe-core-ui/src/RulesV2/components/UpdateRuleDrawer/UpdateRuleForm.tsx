import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/core/components/CreateUpdateRuleFormV2';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { useUpdateRule } from '@/RulesV2/hooks/useUpdateRule';
import { TRuleUpdateResponse } from '@/RulesV2/hooks/useUpdateRule/types';
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
        queryKey: QUERY_KEYS.rulesV2.rule({ name: rule.name }),
      });
      onSuccess?.(response);
    },
    name: rule.name,
  });

  const handleUpdateRule = (values: CreateUpdateRuleFormData) => {
    updateRule({
      ...values,
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
          severity: rule.severity as 'low' | 'medium' | 'high' | 'critical',
          cel_filter: rule.cel_filter ?? undefined,
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
