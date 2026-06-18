import { cn } from '@/core/utils/style';
import { Spin } from 'antd';

interface RouteLoaderProps {
  className?: string;
}
export const RouteLoader = ({ className }: RouteLoaderProps) => {
  return (
    <div
      className={cn(
        className,
        'flex items-center justify-center h-full w-full',
      )}
    >
      <Spin />
    </div>
  );
};
