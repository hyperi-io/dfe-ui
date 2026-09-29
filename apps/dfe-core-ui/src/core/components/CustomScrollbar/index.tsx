import { cn } from '@/core/utils/style';
import { HTMLAttributes } from 'react';

interface CustomScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  innerPadding?: boolean;
  height: number | string;
}

const formatHeight = (height: number | string) => {
  if (typeof height === 'number') {
    return `${height}px`;
  }

  return height;
};

export const CustomScrollbar = ({
  children,
  innerPadding = true,
  height,
  className,
  ...props
}: CustomScrollbarProps) => {
  return (
    <div
      className={cn(
        innerPadding && 'pr-2',
        // Height and overflow
        `max-h-[${formatHeight(height)}] overflow-y-auto`,
        // Scrollbar styling
        '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-track]:bg-gray-800 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
