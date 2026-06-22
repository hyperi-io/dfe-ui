import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
} from '@/Rules/components/CreateUpdateRuleForm';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { useCreateRule } from '@/Rules/hooks/useCreateRule';

import { useSourceType } from '@/Rules/components/CreateUpdateRuleForm/hooks/useHyperdxSource';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateRuleDrawer = ({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) => {
  const title = 'Add Rule';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const { sourceType } = useSourceType();
  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const { refetch: refetchRules, setSelectedRuleId } = useListRulesContext();
  const {
    mutate: createRuleMutation,
    isPending,
    error,
    reset: resetCreateRule,
  } = useCreateRule({
    onSuccess: (response) => {
      setSelectedRuleId(response.rule.rule_id);
      refetchRules();
      setIsDrawerVisible(false);
      api.success({
        title: 'Rule created successfully',
        placement: 'bottomLeft',
      });
    },
  });
  const handleCreateRule = (values: CreateUpdateRuleFormData) => {
    createRuleMutation({
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
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.rule_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            {title}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{
            show: true,
            placement: 'bottom',
          }}
        >
          <Button
            type="default"
            disabled
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            {title}
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={title}
        open={isDrawerVisible}
        size="80%"
        onClose={handleClose}
      >
        <CreateUpdateRuleForm
          onFinish={handleCreateRule}
          onValuesChange={resetCreateRule}
          isPending={isPending}
          error={error}
          buttonLabel={title}
          initialValues={{
            name: '',
            user_sql: '',
            severity: 'medium',
            source_type: 'raw',
            cel_filter: '',
            hunt_name: '',
          }}
        />
      </Drawer>
    </>
  );
};
