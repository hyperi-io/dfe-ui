import { Popover } from '@/core/components/Popover';
import { IconSettings } from '@repo/dfe-icons';
import { Button } from 'antd';
import { SettingsActionPopoverContent } from './SettingsActionPopoverContent';

export const SettingsActionButton = () => {
  return (
    <Popover
      destroyOnHidden
      trigger="click"
      content={<SettingsActionPopoverContent />}
      placement="topLeft"
      classNames={{
        content: 'min-w-84',
      }}
    >
      <Button
        className="-ml-1 bg-background-muted dark:bg-dark-background-muted hover:bg-foreground/10 dark:hover:bg-dark-foreground/10 text-[14px]"
        type="text"
        shape="circle"
        icon={<IconSettings />}
        aria-label="Settings actions"
      />
    </Popover>
  );
};
