import { cn } from '@/core/utils/style';
import { IconChevronDown, IconChevronUp } from '@dfe/icons';
import { Button } from 'antd';
import { useState } from 'react';

interface SimpleCollapseProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
export const SimpleCollapse = ({
  title,
  className,
  children,
}: SimpleCollapseProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        'w-full',
        'flex flex-col gap-y-2',
        'border-b border-foreground/10 dark:border-dark-foreground/10',
        'p-2',
        className,
      )}
    >
      <div className="flex justify-between items-center">
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
      {open && children}
    </div>
  );
};
