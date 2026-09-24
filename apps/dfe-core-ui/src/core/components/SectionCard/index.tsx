import { cn } from '@/core/utils/style';

export const SectionCard = ({
  icon,
  title,
  description,
  rightTitleSlot,
  children,
  className,
  classNames,
}: {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: string | React.ReactNode;
  rightTitleSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  classNames?: {
    title?: string;
    description?: string;
  };
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 mb-4 border-b border-foreground/20 dark:border-dark-foreground/20 pb-6',
        className,
      )}
    >
      <div className="flex justify-between items-center">
        {/* Both, not either: `title || description` short-circuited on the title
            and dropped every description a titled section carried. Callers own
            their own heading element, so the title renders as supplied. */}
        {(title || description) && (
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                'flex items-center gap-2 font-semibold',
                classNames?.title,
              )}
            >
              {icon}
              {title}
            </span>
            {description && (
              <div
                className={cn(
                  'text-foreground/50 dark:text-dark-foreground/50 text-sm',
                  classNames?.description,
                )}
              >
                {description}
              </div>
            )}
          </div>
        )}

        {rightTitleSlot}
      </div>
      {children}
    </div>
  );
};
