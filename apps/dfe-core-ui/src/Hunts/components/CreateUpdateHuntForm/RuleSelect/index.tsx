import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchInfiniteFilteredRules } from '@/core/hooks/useFetchInfiniteFilteredRules';
import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';

export const RuleSelect = ({ value, ...props }: SelectProps) => {
  const {
    data: { items: rules = [] } = {},
    isLoading,
    error,
  } = useFetchInfiniteFilteredRules();
  const options = useMemo(() => {
    const fromApi =
      rules?.map((rule) => ({
        label: rule.name,
        value: rule.rule_id,
      })) ?? [];
    const selectedIds = Array.isArray(value)
      ? value
      : value != null
        ? [value]
        : [];
    const knownIds = new Set(fromApi.map((option) => option.value));
    const fromInitialValues = selectedIds
      .filter((ruleId) => !knownIds.has(ruleId))
      .map((ruleId) => ({ label: ruleId, value: ruleId }));

    return [...fromInitialValues, ...fromApi];
  }, [rules, value]);

  return (
    <RbacProtected action={RbacProtected.rbacActions.rule_read}>
      <RbacProtected.Unrestricted>
        <Select
          {...props}
          value={value}
          options={options}
          loading={isLoading}
          disabled={isLoading || !!error}
        />
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Select disabled {...props} />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
