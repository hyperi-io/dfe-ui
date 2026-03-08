import { cn } from '@/core/utils/style';
import { usePathname } from 'next/navigation';
import { featureFlagSidebarMenuItems } from './constants';

interface SidebarMenuProps {
  collapsed: boolean;
}

export const SidebarMenu = ({ collapsed }: SidebarMenuProps) => {
  const pathname = usePathname();
  const isSelected = (key: string) =>
    key.replace('/', '') === pathname.split('/')[1];

  return (
    <ul className={cn(collapsed ? 'max-w-24' : 'max-w-96')}>
      {featureFlagSidebarMenuItems.map((item) => (
        <li
          className={cn(
            'hover:bg-tertiary/20 focus:bg-tertiary/20',
            isSelected(item.key) && 'border-r-4 border-tertiary',
            !isSelected(item.key) &&
              'opacity-70 hover:opacity-100 transition-opacity duration-300',
          )}
          key={item.key}
        >
          <item.Component collapsed={collapsed} />
        </li>
      ))}
    </ul>
  );
};
