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
    <div className="flex items-center w-full max-w-full min-w-0 gap-x-1 group">
      <Typography.Text
        onClick={onClick}
        className={cn(
          'mb-0! flex flex-1 min-w-0 flex-start p-1 gap-x-1 overflow-hidden cursor-pointer',
          selected && 'text-tertiary! dark:text-dark-foreground! font-semibold',
        )}
      >
        <span className="mt-1">{icon}</span>
        <span className="flex items-center flex-1 min-w-16 overflow-hidden gap-x-1">
          {typeof title === 'string' ? (
            <span className="min-w-0 truncate">{title}</span>
          ) : (
            title
          )}
        </span>
      </Typography.Text>

      {/* Beside the label, never over it, so a click on the name always selects. */}
      {hoverActions && (
        <div className="flex shrink-0 items-center gap-x-1 w-0 overflow-hidden group-hover:w-auto group-hover:overflow-visible group-focus-within:w-auto group-focus-within:overflow-visible">
          {hoverActions}
        </div>
      )}
      {actions && (
        <div className="flex shrink-0 items-center gap-x-1">{actions}</div>
      )}
    </div>
  );
};
