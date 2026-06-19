import { cn } from '@/core/utils/style';

type DisplayType = 'default' | 'warning';

export const NotificationCard = ({
  icon,
  description,
  className,
  type = 'default',
  title,
}: {
  icon?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  type?: DisplayType;
  title?: string;
}) => {
  const displayType = {
    default: cn(
      // Card Border & Background
      'border-foreground/30 bg-foreground/10 dark:border-dark-foreground/50 dark:bg-dark-foreground/10',
    ),
    warning: cn(
      // Card Border & Background
      'border-warning/30 bg-warning/10 dark:border-dark-warning/50 dark:bg-dark-warning/10',
    ),
  };
  return (
    <div
      className={cn(
        // Layout
        'flex items-center gap-2',
        // Text
        'text-foreground/70 dark:text-dark-foreground/70 border',
        // Card Shared Styles
        'rounded-lg px-3 py-2',
        displayType[type],
        className,
      )}
    >
      {icon && icon}

      <div className="flex flex-col gap-1">
        {typeof title === 'string' ? (
          <h3 className="text-sm font-medium text-foreground-muted dark:text-dark-foreground-muted">
            {title}
          </h3>
        ) : (
          title
        )}

        {typeof description === 'string' ? (
          <p className="text-sm text-foreground-muted dark:text-dark-foreground-muted">
            {description}
          </p>
        ) : (
          description
        )}
      </div>
    </div>
  );
};
