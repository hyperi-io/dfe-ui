import { cn } from '@/core/utils/style';

type DisplayType =
  'default' | 'warning' | 'error' | 'info' | 'action' | 'success';

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
  children,
  showChildren = true,
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
  children?: React.ReactNode;
  showChildren?: boolean;
}) => {
  const displayType = {
    default: cn(
      // Card Border & Background
      'border-foreground/30 bg-foreground/10 dark:border-dark-foreground/30 dark:bg-dark-foreground/10',
    ),
    warning: cn(
      // Card Border & Background
      'border-warning/30 bg-warning/10 dark:border-dark-warning/25 dark:bg-dark-warning/25',
    ),
    error: cn(
      // Card Border & Background
      'border-error/30 bg-error/10 dark:border-dark-error/25 dark:bg-dark-error/25',
    ),
    info: cn(
      // Card Border & Background
      'border-info/30 bg-info/10 dark:border-dark-info/25 dark:bg-dark-info/25',
    ),
    action: cn(
      // Card Border & Background
      'border-purple-500/50 bg-purple-500/10',
    ),
    success: cn(
      // Card Border & Background
      'border-success/50 bg-success/10 dark:border-dark-success/25 dark:bg-dark-success/25',
    ),
  };

  // The subtle variant quiets the border and fill. Fading the whole card put
  // its text at 2.7:1, under the 4.5:1 AA floor.
  const subtleType = {
    default: cn(
      'border-foreground/20 bg-foreground/5 dark:border-dark-foreground/20 dark:bg-dark-foreground/5',
    ),
    warning: cn(
      'border-warning/20 bg-warning/5 dark:border-dark-warning/15 dark:bg-dark-warning/15',
    ),
    error: cn(
      'border-error/20 bg-error/5 dark:border-dark-error/15 dark:bg-dark-error/15',
    ),
    info: cn(
      'border-info/20 bg-info/5 dark:border-dark-info/15 dark:bg-dark-info/15',
    ),
    action: cn('border-purple-500/30 bg-purple-500/5'),
    success: cn(
      'border-success/30 bg-success/5 dark:border-dark-success/15 dark:bg-dark-success/15',
    ),
  };

  const displayVariant = {
    default: cn(''),
    subtle: subtleType[type],
    ghost: cn(
      // Card Border & Background
      'bg-unset dark:bg-unset',
    ),
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2', // Text
        'text-foreground/70 dark:text-dark-foreground border',
        // Card Shared Styles
        'rounded-lg px-3 py-2',
        displayType[type],
        displayVariant[variant],
        className,
        classNames?.root,
        className,
      )}
    >
      <div
        className={cn(
          // Layout
          'flex items-center gap-2',
        )}
      >
        {icon && <div className="flex flex-start shrink-0">{icon}</div>}
        <div className={cn('flex flex-col gap-1 ', classNames?.container)}>
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
      {showChildren && children}
    </div>
  );
};
