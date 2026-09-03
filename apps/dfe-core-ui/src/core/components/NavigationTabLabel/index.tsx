import { cn } from '@/core/utils/style';
import { ReactNode } from 'react';

export const NavigationTabLabel = ({
  className,
  label,
  description,
}: {
  className?: string;
  label: ReactNode;
  description: string;
}) => {
  return (
    <div
      className={cn('flex flex-col gap-1 text-left max-w-60 h-full', className)}
    >
      <p className="text-base font-semibold">{label}</p>
      <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs whitespace-normal">
        {description}
      </span>
    </div>
  );
};
