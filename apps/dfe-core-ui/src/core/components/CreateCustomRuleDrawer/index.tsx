import { ButtonLinkSavedSearch } from '@/core/components/ButtonLinkSavedSearch';
import {
  CreateUpdateRuleForm,
  CreateUpdateRuleFormData,
  DEFAULT_ESTIMATE_COST,
} from '@/core/components/CreateUpdateRuleForm';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ruleSaveNotice } from '@/core/components/RuleSaveNotice';
import { useListRulesContext } from '@/core/contexts/ListRulesContext';
import { useCreateRule } from '@/core/hooks/useCreateRule';
import { TRuleCreateResponse } from '@/core/hooks/useCreateRule/types';

import { Button, ButtonProps, notification } from 'antd';
import { useState } from 'react';

export const CreateCustomRuleDrawer = ({
  open,
  onClose,
  onSuccess,
  redirectOnCreate = true,
  classNames,
  button = {
    type: 'text',
  },
  showCreateFromSearch = false,
}: {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: (response: TRuleCreateResponse) => void;
  redirectOnCreate?: boolean;
  classNames?: {
    button?: ButtonProps['classNames'];
  };
  button?: {
    type: 'text' | 'default';
    className?: string;
    icon?: React.ReactNode;
  };
  showCreateFromSearch?: boolean;
}) => {
  const title = 'Add Custom Rule';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const { setSelectedRuleName } = useListRulesContext();
  const {
    mutate: createRuleMutation,
    isPending,
    error,
    reset: resetCreateRule,
  } = useCreateRule({
    onSuccess: (response) => {
      if (redirectOnCreate) {
        setSelectedRuleName(response.rule.name);
      }
      setIsDrawerVisible(false);
      api.open(ruleSaveNotice(response, 'created'));
      onSuccess?.(response);
    },
  });
  const handleCreateRule = (values: CreateUpdateRuleFormData) => {
    createRuleMutation({
      ...values,
      source_type: 'raw',
      estimate_cost: values.estimate_cost ?? DEFAULT_ESTIMATE_COST,
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
            type={button.type}
            className={button.className}
            classNames={classNames?.button}
            icon={button.icon}
            onClick={() => setIsDrawerVisible(true)}
          >
            {title}
          </Button>
          {showCreateFromSearch && <ButtonLinkSavedSearch target="_blank" />}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          visibleTo={RbacProtected.rbacActions.rule_read}
          tooltip={{
            show: true,
            placement: 'bottom',
          }}
        >
          <Button
            type={button.type}
            disabled
            className={button.className}
            classNames={classNames?.button}
            icon={button.icon}
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
