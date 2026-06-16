import { cn } from '@/core/utils/style';
import { Typography } from 'antd';

interface TreeInteractiveLabelProps {
  icon?: React.ReactNode;
  title: React.ReactNode | string;
  onClick?: () => void;
  selected?: boolean;
  actions?: React.ReactNode;
}
export const TreeInteractiveLabel = ({
  icon,
  title,
  onClick,
  selected,
  actions,
}: TreeInteractiveLabelProps) => {
  return (
    <div className="group relative flex w-full min-w-0 max-w-full items-center">
      <Typography.Text
        onClick={onClick}
        className={cn(
          'mb-0! flex w-full min-w-0 max-w-full flex-start p-1 gap-x-1 overflow-hidden cursor-pointer',
          selected && 'text-tertiary! dark:text-dark-foreground! font-semibold',
        )}
      >
        <span className="mt-1">{icon}</span>
        <span className="flex min-w-0 flex-1 items-center gap-x-1 overflow-hidden">
          {typeof title === 'string' ? (
            <span className="min-w-0 truncate">{title}</span>
          ) : (
            title
          )}
        </span>
      </Typography.Text>

      {actions ? (
        <div
          className={cn(
            //Layout
            'absolute top-1/2 right-0 z-10 flex -translate-y-1/2 items-center gap-x-1',
            //Visibility - Only show actions when hovering or focusing on the label
            'pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
};
