import { IconUser } from '@repo/dfe-icons';
import { Button, Popover } from 'antd';
import { UserActionsPopoverContent } from './UserActionsPopoverContent';

export const UserActionsButton = () => {
  return (
    <Popover
      destroyOnHidden
      trigger="click"
      content={<UserActionsPopoverContent />}
      placement="topLeft"
      classNames={{
        content: 'min-w-84',
      }}
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
