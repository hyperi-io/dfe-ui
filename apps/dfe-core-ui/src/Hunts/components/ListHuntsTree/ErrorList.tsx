import { cn } from '@/core/utils/style';
import { IconInfoCircle } from '@repo/dfe-icons';

export const ErrorList = ({
  message,
  className,
}: {
  message: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex flex-col items-center gap-2 text-center',
        className,
      )}
    >
      <IconInfoCircle className="w-6 h-6 text-error" />
      <div className="flex flex-col">
        <h2 className="font-medium text-md">Unable to load hunts</h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          {message}
        </p>
      </div>
    </div>
  );
};
