import { IconWrapper } from '@/core/components/IconWrapper';
import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { cn } from '@/core/utils/style';
import {
  IconMoon as MoonOutlined,
  IconSun as SunOutlined,
} from '@hyperi/icons';
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
        aria-label={`Switch to ${
          colorMode === 'light' ? 'dark' : 'light'
        } mode`}
      >
        {colorMode === 'light' ? (
          <IconWrapper icon={<MoonOutlined />} className="text-[14px]" />
        ) : (
          <IconWrapper
            icon={<SunOutlined />}
            className="text-[14px] text-yellow-400"
          />
        )}
      </Button>
    </Tooltip>
  );
};
