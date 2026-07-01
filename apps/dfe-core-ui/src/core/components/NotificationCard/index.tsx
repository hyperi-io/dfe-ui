import { cn } from '@/core/utils/style';

type DisplayType = 'default' | 'warning' | 'error' | 'info' | 'action';

export const NotificationCard = ({
  icon,
  description,
  className,
  type = 'default',
  title,
  action,
}: {
  icon?: React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  type?: DisplayType;
  title?: string | React.ReactNode;
  action?: React.ReactNode;
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
    error: cn(
      // Card Border & Background
      'border-error/30 bg-error/10 dark:border-dark-error/50 dark:bg-dark-error/10',
    ),
    info: cn(
      // Card Border & Background
      'border-info/30 bg-info/10 dark:border-dark-info/50 dark:bg-dark-info/10',
    ),
    action: cn(
      // Card Border & Background
      'border-purple-500/30 bg-purple-500/10',
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
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
};
