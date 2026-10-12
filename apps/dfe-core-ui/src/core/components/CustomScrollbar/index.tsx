import { cn } from '@/core/utils/style';
import { HTMLAttributes } from 'react';

interface CustomScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  innerPadding?: boolean;
  height: number;
}

export const CustomScrollbar = ({
  children,
  innerPadding = true,
  height,
  className,
  ...props
}: CustomScrollbarProps) => {
  return (
    <div
      style={{
        // Fixed height, not max-height: a max-height box grows with its
        // content and can sit taller than a clipped parent, so the last
        // rows are below the fold and the scrollport never reaches them.
        height: `${height}px`,
        maxHeight: `${height}px`,
      }}
      className={cn(
        innerPadding && 'pr-2',
        // Height and overflow
        `overflow-y-auto overflow-x-hidden`,
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
