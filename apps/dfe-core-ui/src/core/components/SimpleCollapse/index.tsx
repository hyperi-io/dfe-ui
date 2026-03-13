import { cn } from '@/core/utils/style';
import { IconChevronDown, IconChevronUp } from '@dfe/icons';
import { Button } from 'antd';
import { useState } from 'react';

interface SimpleCollapseProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  classNames?: {
    container?: string;
    title?: string;
    content?: string;
  };
}
export const SimpleCollapse = ({
  title,
  className,
  children,
  defaultOpen = false,
  classNames,
}: SimpleCollapseProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn(
        'w-full',
        'flex flex-col gap-y-2',
        'border-b border-foreground/10 dark:border-dark-foreground/10',
        'p-2',
        className,
        classNames?.container,
      )}
    >
      <div
        className={cn('flex justify-between items-center', classNames?.title)}
      >
        {title}
        <Button
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          type="link"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <IconChevronUp className="text-foreground dark:text-dark-foreground" />
          ) : (
            <IconChevronDown className="text-foreground dark:text-dark-foreground" />
          )}
        </Button>
      </div>
      {open && <div className={classNames?.content}>{children}</div>}
    </div>
  );
};
