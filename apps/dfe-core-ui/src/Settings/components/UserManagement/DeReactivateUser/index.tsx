import { IconLock } from '@repo/dfe-icons';
import { Button } from 'antd';

export const DeReactivateUser = ({
  isActive = true,
}: {
  isActive: boolean;
}) => {
  const actionTitle = isActive ? 'Deactivate user' : 'Activate user';
  return (
    <Button
      aria-label={actionTitle}
      type="text"
      icon={<IconLock />}
      onClick={() => {
        // eslint-disable-next-line no-alert
        window.alert(actionTitle);
      }}
    >
      {actionTitle}
    </Button>
  );
};
