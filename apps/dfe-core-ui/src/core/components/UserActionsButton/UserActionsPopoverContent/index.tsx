import { IconWrapper } from '@/core/components/IconWrapper';
import { useLogout } from '@/core/hooks/useLogout';
import { IconLogout as LogoutOutlined } from '@dfe/icons';
import { Button } from 'antd';

export const UserActionsPopoverContent = () => {
  const { handleLogout } = useLogout();
  return (
    <div className="flex flex-col gap-y-2">
      <Button
        color="default"
        variant="outlined"
        icon={<IconWrapper icon={<LogoutOutlined />} />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
};
