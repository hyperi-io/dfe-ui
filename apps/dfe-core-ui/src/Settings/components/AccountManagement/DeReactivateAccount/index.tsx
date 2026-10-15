import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useUpdateAccount } from '@/Settings/hooks/accounts/useUpdateAccount';
import { IconLock } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const DeReactivateAccount = ({
  username,
  isActive,
}: {
  username: string;
  isActive: boolean;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { notification } = App.useApp();
  const actionTitle = isActive ? 'Deactivate Account' : 'Activate Account';

  const { mutate, isPending, error, reset } = useUpdateAccount({
    username,
    onSuccess: () => {
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

  const handleCancel = () => {
    setIsConfirming(false);
    reset();
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
          open={isConfirming || !!error}
          destroyOnHidden
          onCancel={handleCancel}
          okText="Deactivate"
          okType="danger"
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel}>Cancel</Button>
            </div>
          }
        >
          <p>
            You are trying to deactivate an account that cannot be deactivated.
          </p>
          {error && <NotificationCard type="error" title={error.message} />}
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
