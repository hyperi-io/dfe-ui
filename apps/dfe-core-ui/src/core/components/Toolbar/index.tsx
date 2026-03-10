import { cn } from '@/core/utils/style';

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Toolbar = ({ className, children }: ToolbarProps) => {
  return (
    <div
      className={cn(
        `min-h-(--toolbar-height)`,
        'pl-6 pr-4 py-2 flex items-center bg-background dark:bg-dark-background border-b border-solid border-background-secondary dark:border-dark-background-secondary shadow-xs',
        className,
      )}
    >
      {children}
    </div>
  );
};
