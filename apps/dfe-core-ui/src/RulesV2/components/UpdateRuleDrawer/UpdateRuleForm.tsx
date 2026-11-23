import { CreateUpdateRuleForm } from '@/core/components/CreateUpdateRuleFormV2';
import { CreateUpdateRuleFormData } from '@/core/components/CreateUpdateRuleFormV2/schema';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { useUpdateRule } from '@/RulesV2/hooks/useUpdateRule';
import { TRuleUpdateResponse } from '@/RulesV2/hooks/useUpdateRule/types';
import { fromApiRootMatch, toApiRootMatch } from '@/RulesV2/utils/ruleMatch';
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
    // Remove the name from the values to avoid updating the rule name
    const { name: _name, ...updateValues } = values;
    updateRule({
      ...updateValues,
      match: updateValues.match
        ? toApiRootMatch(updateValues.match)
        : updateValues.match,
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
          source_type: rule.source_type ?? 'raw',
          match: rule.match ? fromApiRootMatch(rule.match) : rule.match,
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
