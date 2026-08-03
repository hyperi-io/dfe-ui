import { cn } from '@/core/utils/style';
import { IconAlertCircle } from '@repo/dfe-icons';

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
        'bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex items-center gap-2',
        className,
      )}
    >
      <IconAlertCircle className="w-6 h-6 text-error" />
      <div className="flex flex-col">
        <h2 className="text-lg font-medium">
          There was an unexpected error loading the service configs
        </h2>
        <p>{message}</p>
      </div>
    </div>
  );
};
