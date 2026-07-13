import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { TRuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { IconEdit } from '@repo/dfe-icons';
import { Button, ButtonProps, notification } from 'antd';
import { cloneElement, useState } from 'react';
import { UpdateRuleForm } from './UpdateRuleForm';

interface UpdateRuleDrawerProps {
  rule: TRuleDetail;
  open?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
  onSuccess?: (rule: TRuleUpdateResponse) => void;
}

export const UpdateRuleDrawer = ({
  rule,
  open,
  onClose,
  trigger,
  onSuccess,
}: UpdateRuleDrawerProps) => {
  const title = 'Edit Rule';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const handleOnSuccess = (response: TRuleUpdateResponse) => {
    setIsDrawerVisible(false);
    onClose?.();
    onSuccess?.(response);
    api.success({
      title: `${response.rule.display_name ?? response.rule.name} updated successfully`,
      placement: 'bottomLeft',
    });
  };

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.rule_write}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setIsDrawerVisible(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Button
              type="default"
              className="border border-tertiary text-tertiary"
              icon={<IconEdit className="text-tertiary" />}
              onClick={() => setIsDrawerVisible(true)}
            >
              {title}
            </Button>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="justify-start opacity-100"
          tooltip={{ show: true, placement: 'left' }}
        >
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              disabled: true,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setIsDrawerVisible(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Button
              type="default"
              disabled
              className="border border-tertiary text-tertiary"
              icon={<IconEdit className="text-tertiary" />}
              onClick={() => setIsDrawerVisible(true)}
            >
              {title}
            </Button>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={title}
        open={isDrawerVisible}
        size="80%"
        onClose={handleClose}
      >
        <UpdateRuleForm rule={rule} onSuccess={handleOnSuccess} />
      </Drawer>
    </>
  );
};
