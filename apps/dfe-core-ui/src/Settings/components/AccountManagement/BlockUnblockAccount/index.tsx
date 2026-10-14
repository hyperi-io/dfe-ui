import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useUpdateAccount } from '@/Settings/hooks/accounts/useUpdateAccount';
import { IconLock, IconNoEntry } from '@repo/dfe-icons';
import { App, Button } from 'antd';
import { useState } from 'react';

export const BlockUnblockAccount = ({
  username,
  isBlocked = false,
}: {
  username: string;
  isBlocked: boolean;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { notification } = App.useApp();
  const actionTitle = isBlocked ? 'Unblock Account' : 'Block Account';
  const isEnabled = !isBlocked;

  const { mutate, isPending, error, reset } = useUpdateAccount({
    username,
    onSuccess: () => {
      notification.success({
        title: isBlocked ? 'Account unblocked' : 'Account blocked',
        placement: 'bottomLeft',
      });
    },
  });

  const { data: { user_id: currentUsername } = {} } = useAuthMe();
  const isCurrentUser = currentUsername === username;

  const handleBlockUnblockAccount = () => {
    mutate({ blocked: !isBlocked, enabled: !isEnabled });
  };

  const handleClick = () => {
    if (isCurrentUser) {
      setIsConfirming(true);
    } else {
      handleBlockUnblockAccount();
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
          icon={<IconNoEntry />}
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
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel}>Cancel</Button>
            </div>
          }
        >
          <p>You are trying to block an account that cannot be blocked.</p>

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
        >
          {actionTitle}
        </Button>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
