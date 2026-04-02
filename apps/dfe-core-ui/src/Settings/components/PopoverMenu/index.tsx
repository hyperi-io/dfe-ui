import { cn } from '@/core/utils/style';
import { IconMenu2 } from '@repo/dfe-icons';
import { Button, Popover } from 'antd';

interface PopoverMenuProps {
  options: React.ReactNode[];
  className?: string;
  ariaLabel?: string;
}

export const PopoverMenu = ({
  options,
  className,
  ariaLabel = 'Actions',
}: PopoverMenuProps) => {
  return (
    <Popover
      trigger="click"
      classNames={{
        container: 'p-0.5',
      }}
      destroyOnHidden
      content={
        <ul className="[&_button]:w-full [&_button]:text-left [&_button]:justify-start">
          {options.map((option, index) => (
            <li key={`popover-menu-${index}`}>{option}</li>
          ))}
        </ul>
      }
    >
      <Button
        aria-label={ariaLabel}
        className={cn('absolute top-1 right-1', className)}
        type="default"
        size="small"
        shape="circle"
        icon={<IconMenu2 />}
      />
    </Popover>
  );
};
