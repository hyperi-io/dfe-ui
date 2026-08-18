import { cn } from '@/core/utils/style';

type DisplayType =
  | 'default'
  | 'warning'
  | 'error'
  | 'info'
  | 'action'
  | 'success';

type DisplayVariant = 'default' | 'subtle' | 'ghost';

export const NotificationCard = ({
  icon,
  description,
  className,
  type = 'default',
  title,
  action,
  classNames,
  variant = 'default',
}: {
  icon?: React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  type?: DisplayType;
  title?: string | React.ReactNode;
  action?: React.ReactNode;
  classNames?: {
    root?: string;
    container?: string;
    title?: string;
    description?: string;
    action?: string;
  };
  variant?: DisplayVariant;
}) => {
  const displayType = {
    default: cn(
      // Card Border & Background
      'border-foreground/30 bg-foreground/10 dark:border-dark-foreground dark:bg-dark-foreground',
    ),
    warning: cn(
      // Card Border & Background
      'border-warning/30 bg-warning/10 dark:border-dark-warning dark:bg-dark-warning',
    ),
    error: cn(
      // Card Border & Background
      'border-error/30 bg-error/10 dark:border-dark-error dark:bg-dark-error',
    ),
    info: cn(
      // Card Border & Background
      'border-info/30 bg-info/10 dark:border-dark-info dark:bg-dark-info',
    ),
    action: cn(
      // Card Border & Background
      'border-purple-500/50 bg-purple-500/10',
    ),
    success: cn(
      // Card Border & Background
      'border-success/50 bg-success/10 dark:border-dark-success dark:bg-dark-success',
    ),
  };

  const displayVariant = {
    default: cn(''),
    subtle: cn('opacity-60'),
    ghost: cn(
      // Card Border & Background
      'bg-unset dark:bg-unset',
    ),
  };

  return (
    <div
      className={cn(
        // Layout
        'flex items-center gap-2',
        // Text
        'text-foreground/70 dark:text-dark-foreground border',
        // Card Shared Styles
        'rounded-lg px-3 py-2',
        displayType[type],
        displayVariant[variant],
        className,
        classNames?.root,
      )}
    >
      {icon && icon}

      <div className={cn('flex flex-col gap-1', classNames?.container)}>
        {typeof title === 'string' ? (
          <h3
            className={cn(
              'text-sm font-medium text-foreground-muted dark:text-dark-foreground-muted',
              classNames?.title,
            )}
          >
            {title}
          </h3>
        ) : (
          title
        )}

        {typeof description === 'string' ? (
          <p
            className={cn(
              'text-sm text-foreground-muted dark:text-dark-foreground-muted',
              classNames?.description,
            )}
          >
            {description}
          </p>
        ) : (
          description
        )}
      </div>
      {action && (
        <div className={cn('ml-auto', classNames?.action)}>{action}</div>
      )}
    </div>
  );
};
