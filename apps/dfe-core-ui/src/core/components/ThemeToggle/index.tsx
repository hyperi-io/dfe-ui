import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { cn } from '@/core/utils/style';
import { IconMoon, IconSun } from '@repo/dfe-icons';
import { Button, Tooltip } from 'antd';

interface ThemeToggleProps {
  className?: string;
  collapsed: boolean;
}

export const ThemeToggle = ({
  className = '',
  collapsed = false,
}: ThemeToggleProps) => {
  const { colorMode, toggleColorMode } = useTheme();

  return (
    <Tooltip
      title={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      placement={collapsed ? 'right' : 'top'}
    >
      <Button
        type="text"
        shape="circle"
        className={cn(
          '-ml-1 flex items-center justify-center bg-background-muted dark:bg-dark-background-muted hover:bg-foreground/10 dark:hover:bg-dark-foreground/10',
          className,
        )}
        onClick={toggleColorMode}
        icon={colorMode === 'light' ? <IconMoon /> : <IconSun />}
        aria-label={`Switch to ${
          colorMode === 'light' ? 'dark' : 'light'
        } mode`}
      ></Button>
    </Tooltip>
  );
};
