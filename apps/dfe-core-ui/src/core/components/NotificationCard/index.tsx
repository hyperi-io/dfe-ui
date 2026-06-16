import { cn } from '@/core/utils/style';

export const NotificationCard = ({
  icon,
  description,
  className,
}: {
  icon?: React.ReactNode;
  description: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        // Layout
        'flex items-center gap-2',
        // Text
        'text-foreground/70 dark:text-dark-foreground/70 border',
        // Card
        'border-foreground/30 bg-foreground/10 dark:border-dark-foreground/50 dark:bg-dark-foreground/10',
        'rounded-lg px-3 py-2',
        className,
      )}
    >
      {icon && icon}

      <p className="text-sm text-foreground-muted dark:text-dark-foreground-muted">
        {description}
      </p>
    </div>
  );
};
