import { RbacProtected } from '@/core/components/RbacProtected';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useUpdateAccount } from '@/Settings/hooks/useUpdateAccount';
import { IconLock } from '@repo/dfe-icons';
import { App, Button, Modal } from 'antd';
import { useState } from 'react';

export const DeReactivateAccount = ({
  username,
  isActive,
  refetch,
}: {
  username: string;
  isActive: boolean;
  refetch: () => void;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { notification } = App.useApp();
  const actionTitle = isActive ? 'Deactivate Account' : 'Activate Account';

  const { mutate, isPending } = useUpdateAccount({
    username,
    onSuccess: () => {
      refetch();
      notification.success({
        title: isActive ? 'Account deactivated' : 'Account activated',
        placement: 'bottomLeft',
      });
    },
  });

  const { data: { user_id: currentUsername } = {} } = useAuthMe();
  const isCurrentUser = currentUsername === username;

  const handleClick = () => {
    if (isCurrentUser) {
      setIsConfirming(true);
    } else {
      mutate({ enabled: !isActive });
    }
  };

  return (
    <RbacProtected action={RbacProtected.rbacActions.account_write}>
      <RbacProtected.Unrestricted>
        <Button
          aria-label={actionTitle}
          type="text"
          icon={<IconLock />}
          loading={isPending}
          disabled={isPending}
          onClick={handleClick}
        >
          {actionTitle}
        </Button>
        <Modal
          title="Confirm Action"
          open={isConfirming}
          destroyOnHidden
          onCancel={() => setIsConfirming(false)}
          onOk={() => mutate({ enabled: !isActive })}
          okText="Deactivate"
          okType="danger"
        >
          <p>
            You are trying to deactivate your own account, you will be logged
            out and will lose access to your account. Are you sure you want to
            continue?
          </p>
        </Modal>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button
          aria-label={actionTitle}
          type="text"
          icon={<IconLock />}
          loading={isPending}
          disabled
          onClick={() => {
            mutate({ enabled: !isActive });
          }}
        >
          {actionTitle}
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
