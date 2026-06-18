import { cn } from '@/core/utils/style';
import { Spin } from 'antd';

interface ButtonLoaderProps {
  className?: string;
}
export const ButtonLoader = ({ className }: ButtonLoaderProps) => {
  return (
    <div
      className={cn(
        'min-h-8 min-w-48',
        className,
        'flex items-center justify-center h-full w-full bg-gray-50',
      )}
    >
      <Spin />
    </div>
  );
};
