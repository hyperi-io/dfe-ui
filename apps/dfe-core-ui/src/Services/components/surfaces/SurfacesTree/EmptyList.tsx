import { cn } from '@/core/utils/style';
import { IconInfoCircle } from '@repo/dfe-icons';

export const EmptyList = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex flex-col items-center gap-2 text-center',
        className,
      )}
    >
      <IconInfoCircle className="w-6 h-6 text-foreground" />
      <div className="flex flex-col">
        <h2 className="text-md font-medium">No surfaces found</h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          Please deploy a service to see the surfaces.
        </p>
      </div>
    </div>
  );
};
