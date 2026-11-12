import { CreateRuleDrawer } from '@/core/components/CreateRuleDrawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ListRulesProvider } from '@/core/contexts/ListRulesContext';
import { useFetchInfiniteFilteredRules } from '@/core/hooks/useFetchInfiniteFilteredRules';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

export const RuleSelect = ({ value, ...props }: SelectProps) => {
  const [ruleValue, setRuleValue] = useState<string[] | null>(value ?? null);
  const {
    data: { items: rules = [] } = {},
    isLoading,
    error,
  } = useFetchInfiniteFilteredRules();
  const options = useMemo(() => {
    const fromApi =
      rules?.map((rule) => ({
        label: rule.display_name,
        value: rule.name,
      })) ?? [];
    const selectedIds = Array.isArray(value)
      ? value
      : value != null
        ? [value]
        : [];
    const knownIds = new Set(fromApi.map((option) => option.value));
    const fromInitialValues = selectedIds
      .filter((name) => !knownIds.has(name))
      .map((name) => ({ label: name, value: name }));

    return [...fromInitialValues, ...fromApi];
  }, [rules, value]);

  const handleChange = (value: string[]) => {
    setRuleValue(value);
    props.onChange?.(value);
  };

  return (
    <RbacProtected action={RbacProtected.rbacActions.rule_read}>
      <RbacProtected.Unrestricted>
        <div className="flex items-center gap-2">
          <Select
            {...props}
            value={ruleValue}
            options={options}
            loading={isLoading}
            disabled={isLoading || !!error}
            onChange={handleChange}
            mode="tags"
          />
          <ListRulesProvider>
            <CreateRuleDrawer
              onSuccess={(response) => {
                handleChange([...(ruleValue ?? []), response.rule.name]);
              }}
              redirectOnCreate={false}
            />
          </ListRulesProvider>
        </div>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Select disabled {...props} />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
