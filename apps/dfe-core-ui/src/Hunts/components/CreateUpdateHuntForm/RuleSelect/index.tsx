import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchInfiniteFilteredRules } from '@/core/hooks/useFetchInfiniteFilteredRules';
import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';

export const RuleSelect = ({ ...props }: SelectProps) => {
  const {
    data: { items: rules = [] } = {},
    isLoading,
    error,
  } = useFetchInfiniteFilteredRules();
  const options = useMemo(() => {
    return (
      rules?.map((rule) => ({
        label: rule.name,
        value: rule.rule_id,
      })) ?? []
    );
  }, [rules]);

  return (
    <RbacProtected action={RbacProtected.rbacActions.rule_read}>
      <RbacProtected.Unrestricted>
        <Select
          {...props}
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
