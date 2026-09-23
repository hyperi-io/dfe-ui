import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import type { IconComponent } from '@repo/dfe-icons';
import Link from 'next/link';

interface SidebarLinkProps {
  collapsed: boolean;
  item: {
    key: string;
    icon: React.ReactElement<IconComponent & { className?: string }>;
    label: string;
    external: boolean;
  };
  disabled?: boolean;
}

export const SidebarLink = ({
  collapsed,
  item,
  disabled = false,
}: SidebarLinkProps) => {
  const isExternalLink = item.external;

  return (
    <Tooltip title={collapsed ? item.label : null} placement="right">
      {isExternalLink ? (
        <a
          href={item.key}
          {...(disabled
            ? { 'aria-disabled': true, onClick: (e) => e.preventDefault() }
            : {})}
          target="_blank"
          rel="noreferrer noopener nofollow"
          className={cn(
            'flex w-full gap-3 px-7 py-2 ',
            'dark:text-dark-foreground! text-foreground!',
            'focus:bg-tertiary/20',
            disabled && 'pointer-events-none',
          )}
        >
          <span className="ml-1">{item.icon}</span>

          {!collapsed && <span className="text-md">{item.label}</span>}
        </a>
      ) : (
        <Link
          href={item.key}
          {...(disabled
            ? { 'aria-disabled': true, onClick: (e) => e.preventDefault() }
            : {})}
          className={cn(
            'flex w-full gap-3 px-7 py-2 ',
            'dark:text-dark-foreground! text-foreground!',
            'focus:bg-tertiary/20',
            disabled && 'pointer-events-none',
          )}
        >
          <span className="ml-1">{item.icon}</span>

          {!collapsed && <span className="text-md">{item.label}</span>}
        </Link>
      )}
    </Tooltip>
  );
};
