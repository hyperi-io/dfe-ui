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
    <div className="group flex items-center justify-between">
      <Typography.Text
        onClick={onClick}
        className={cn(
          'flex items-center overflow-hidden align-middle cursor-pointer gap-x-1 text-ellipsis whitespace-nowrap',
          selected && 'text-tertiary! dark:text-dark-foreground! font-semibold',
        )}
      >
        {icon}
        {title}
      </Typography.Text>

      {actions ? (
        <div
          className={cn(
            // Layout
            'flex items-center gap-x-2',
            // Visibility - Only show actions when hovering or focusing on the label
            'pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100',
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
};
