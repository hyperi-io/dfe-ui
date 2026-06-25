import { cn } from '@/core/utils/style';
import { IconInfoCircle } from '@repo/dfe-icons';

export const EmptyDetail = ({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center w-full h-full',
        className,
      )}
    >
      <IconInfoCircle className="w-6 h-6 text-foreground" />
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="text-foreground-muted dark:text-dark-foreground-muted">
        {description}
      </p>
    </div>
  );
};
