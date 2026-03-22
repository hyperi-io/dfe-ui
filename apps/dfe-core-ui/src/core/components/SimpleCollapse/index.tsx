'use client';

import { cn } from '@/core/utils/style';
import { IconChevronDown, IconChevronUp } from '@dfe/icons';
import { useState, type ReactNode } from 'react';

export interface SimpleCollapseRenderProps {
  setOpen: (open: boolean) => void;
}

interface SimpleCollapseProps {
  title: React.ReactNode;
  children: ReactNode | ((props: SimpleCollapseRenderProps) => ReactNode);
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
  const collapseProps: SimpleCollapseRenderProps = { setOpen };

  const content =
    typeof children === 'function' ? children(collapseProps) : children;

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
      <button
        aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
        type="button"
        className={cn('flex justify-between items-center', classNames?.title)}
        onClick={() => setOpen(!open)}
      >
        {title}
        <span onClick={() => setOpen(!open)}>
          {open ? (
            <IconChevronUp className="text-foreground dark:text-dark-foreground" />
          ) : (
            <IconChevronDown className="text-foreground dark:text-dark-foreground" />
          )}
        </span>
      </button>
      {open && <div className={classNames?.content}>{content}</div>}
    </div>
  );
};
