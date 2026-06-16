import { cn } from '@/core/utils/style';

export const SectionCard = ({
  title,
  description,
  rightTitleSlot,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: string;
  rightTitleSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 mb-4 border-b border-foreground/20 dark:border-dark-foreground/20 pb-6',
        className,
      )}
    >
      <div className="flex justify-between items-center">
        {title && description && (
          <div className="flex flex-col gap-1">
            {title && (
              <h1 className="text-base font-semibold text-foreground-muted dark:text-dark-foreground-muted">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-foreground/50 dark:text-dark-foreground/50 text-sm">
                {description}
              </p>
            )}
          </div>
        )}

        {rightTitleSlot}
      </div>
      {children}
    </div>
  );
};
