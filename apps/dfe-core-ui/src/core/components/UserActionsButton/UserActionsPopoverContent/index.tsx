import { useLogout } from '@/core/hooks/useLogout';
import { IconLogout } from '@repo/dfe-icons';
import { Button } from 'antd';

export const UserActionsPopoverContent = () => {
  const { handleLogout } = useLogout();

  return (
    <div className="flex flex-col gap-y-2">
      <Button
        color="default"
        variant="outlined"
        icon={<IconLogout />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
};
