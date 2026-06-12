import { cn } from '@/core/utils/style';

interface FormNotificationProps {
  title?: string;
  text: string | React.ReactNode;
  type?: 'error' | 'success' | 'warning' | 'info' | 'default';
  className?: string;
}

export const FormNotification = ({
  text,
  title,
  type = 'default',
  className,
}: FormNotificationProps) => {
  return (
    <div
      className={cn(
        'border rounded-md p-2 text-sm flex flex-col gap-2',
        type === 'error' && 'border-error bg-error/10 text-error',
        type === 'success' &&
          'border-green-500 bg-green-500/10 text-green-500 dark:border-dark-success dark:bg-dark-success/10 dark:text-dark-success',
        type === 'warning' && 'border-warning bg-warning/10 text-warning',
        type === 'info' && 'border-info bg-info/10 text-info',
        type === 'default' &&
          'border-foreground-muted bg-foreground-muted/10 text-foreground-muted dark:border-dark-foreground-muted dark:bg-dark-foreground-muted/10 dark:text-dark-foreground-muted',
        className,
      )}
    >
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      {text && (
        <>
          {typeof text === 'string' ? <p className="text-sm">{text}</p> : text}
        </>
      )}
    </div>
  );
};
