import { RbacProtected } from '@/core/components/RbacProtected';
import { useUpdateAccount } from '@/Settings/hooks/useUpdateAccount';
import { IconLock } from '@repo/dfe-icons';
import { App, Button } from 'antd';

export const DeReactivateUser = ({
  username,
  isActive,
  refetch,
}: {
  username: string;
  isActive: boolean;
  refetch: () => void;
}) => {
  const { notification } = App.useApp();
  const actionTitle = isActive ? 'Deactivate user' : 'Activate user';

  const { mutate, isPending } = useUpdateAccount({
    username,
    onSuccess: () => {
      refetch();
      notification.success({
        title: isActive ? 'User deactivated' : 'User activated',
        placement: 'bottomLeft',
      });
    },
  });

  return (
    <RbacProtected action={RbacProtected.rbacActions.account_write}>
      <RbacProtected.Unrestricted>
        <Button
          aria-label={actionTitle}
          type="text"
          icon={<IconLock />}
          loading={isPending}
          disabled={isPending}
          onClick={() => {
            mutate({ enabled: !isActive });
          }}
        >
          {actionTitle}
        </Button>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
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
