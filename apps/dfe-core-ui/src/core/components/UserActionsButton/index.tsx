import { IconUser } from '@dfe/icons';
import { Button, Popover } from 'antd';
import { UserActionsPopoverContent } from './UserActionsPopoverContent';

interface UserActionsButtonProps {
  collapsed: boolean;
}
export const UserActionsButton = ({
  collapsed = false,
}: UserActionsButtonProps) => {
  return (
    <Popover
      destroyOnHidden
      trigger="click"
      content={<UserActionsPopoverContent />}
      placement={collapsed ? 'right' : 'top'}
    >
      <Button
        className="-ml-1 bg-background-muted dark:bg-dark-background-muted hover:bg-foreground/10 dark:hover:bg-dark-foreground/10 text-[14px]"
        type="text"
        shape="circle"
        icon={<IconUser />}
        aria-label="User actions"
      />
    </Popover>
  );
};
