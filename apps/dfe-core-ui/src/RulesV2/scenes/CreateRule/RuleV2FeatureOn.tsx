'use client';

import { CreateUpdateRuleForm } from '@/core/components/CreateUpdateRuleFormV2';
import { CreateUpdateRuleFormData } from '@/core/components/CreateUpdateRuleFormV2/schema';
import { useCreateRule } from '@/core/hooks/useCreateRuleV2';
import { ruleSaveNotice } from '@/RulesV2/components/RuleSaveNotice';
import { toApiRootMatch } from '@/RulesV2/utils/ruleMatch';
import { App } from 'antd';
import { useRouter } from 'next/navigation';

export const RuleV2FeatureOn = () => {
  const router = useRouter();
  const { notification } = App.useApp();
  const {
    mutate: createRule,
    isPending,
    error: createRuleError,
  } = useCreateRule({
    onSuccess: (response) => {
      notification.open(ruleSaveNotice(response, 'created'));
      router.push(`/rules?name=${encodeURIComponent(response.rule.name)}`);
    },
  });

  const handleCreateCustomRule = (values: CreateUpdateRuleFormData) => {
    createRule({
      ...values,
      source_type: values.source_type ?? 'raw',
      severity: values.severity ?? 'medium',
      name: values.name ?? '',
      display_name: values.display_name || undefined,
      user_sql: values.user_sql ?? '',
      cel_filter: values.cel_filter ?? '',
      match: values.match ? toApiRootMatch(values.match) : values.match,
    });
  };
  return (
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
  );
};
