import { cn } from '@/core/utils/style';

interface ContentCardProps {
  className?: string;
  children: React.ReactNode;
}

export const ContentCard = ({ className, children }: ContentCardProps) => {
  return (
    <div
      className={cn(
        'px-6 py-4 bg-background dark:bg-dark-background',
        className,
      )}
    >
      {children}
    </div>
  );
};
