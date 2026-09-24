import { Popover } from '@/core/components/Popover';
import { cn } from '@/core/utils/style';
import { IconMenu2 } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

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
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      classNames={{
        container: 'p-0.5',
      }}
      destroyOnHidden={false}
      content={
        <ul
          className="[&_button]:w-full [&_button]:text-left [&_button]:justify-start"
          onClick={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
        >
          {options.map((option, index) => (
            <li key={`popover-menu-${index}`}>{option}</li>
          ))}
        </ul>
      }
    >
      <Button
        aria-label={ariaLabel}
        className={cn(className)}
        type="default"
        size="small"
        shape="circle"
        icon={<IconMenu2 />}
      />
    </Popover>
  );
};
