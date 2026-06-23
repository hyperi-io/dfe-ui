import { cn } from '@/core/utils/style';
import { Typography } from 'antd';

interface TreeInteractiveLabelProps {
  icon?: React.ReactNode;
  title: React.ReactNode | string;
  onClick?: () => void;
  selected?: boolean;
  hoverActions?: React.ReactNode;
  actions?: React.ReactNode;
}
export const TreeInteractiveLabel = ({
  icon,
  title,
  onClick,
  selected,
  hoverActions,
  actions,
}: TreeInteractiveLabelProps) => {
  return (
    <div className="relative flex items-center w-full max-w-full min-w-0 group">
      <Typography.Text
        onClick={onClick}
        className={cn(
          'mb-0! flex w-full min-w-0 max-w-full flex-start p-1 gap-x-1 overflow-hidden cursor-pointer',
          selected && 'text-tertiary! dark:text-dark-foreground! font-semibold',
        )}
      >
        <span className="mt-1">{icon}</span>
        <span className="flex items-center flex-1 min-w-0 overflow-hidden gap-x-1">
          {typeof title === 'string' ? (
            <span className="min-w-0 truncate">{title}</span>
          ) : (
            title
          )}
        </span>
      </Typography.Text>

      {hoverActions || actions ? (
        <div
          className={cn(
            //Layout
            'flex items-center gap-x-1',
            // Position
            'absolute  top-1/2 right-0 z-10 -translate-y-1/2',
          )}
        >
          {hoverActions && (
            <div
              className={cn(
                //Layout
                'flex items-center gap-x-1',
                //Visibility - Only show actions when hovering or focusing on the label
                'pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
              )}
            >
              {hoverActions}
            </div>
          )}
          {actions && <>{actions}</>}
        </div>
      ) : null}
    </div>
  );
};
