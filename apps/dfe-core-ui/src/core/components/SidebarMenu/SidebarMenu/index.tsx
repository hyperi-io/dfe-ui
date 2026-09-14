'use client';

import { IconWrapper } from '@/core/components/IconWrapper';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SidebarLink } from '@/core/components/SidebarMenu/SidebarLink';
import { useHyperdxUrl } from '@/core/contexts/HyperdxContext';
import { cn } from '@/core/utils/style';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import {
  buildSidebarMenuGroups,
  sidebarMenuItems,
  type SidebarNavGroup,
  type SidebarNavItem,
} from './constants';

interface SidebarMenuProps {
  className?: string;
  collapsed: boolean;
}

// Unpermitted nav items are hidden, not greyed: each renders only inside
// RbacProtected.Unrestricted, with no Restricted fallback. AppLayout's
// no-access guard covers a user for whom none would render.
const NavItem = ({
  item,
  collapsed,
  selected,
}: {
  item: SidebarNavItem;
  collapsed: boolean;
  selected: boolean;
}) => (
  <li
    className={cn(
      'hover:bg-tertiary/20 focus:bg-tertiary/20',
      selected && 'border-r-4 border-tertiary',
      !selected &&
        'opacity-70 hover:opacity-100 transition-opacity duration-300',
    )}
  >
    <RbacProtected action={item.actions}>
      <RbacProtected.Unrestricted>
        <SidebarLink
          collapsed={collapsed}
          item={{
            key: item.key,
            icon: <IconWrapper icon={item.icon} />,
            label: item.label,
            external: false,
          }}
        />
      </RbacProtected.Unrestricted>
    </RbacProtected>
  </li>
);

// A group heading is shown exactly when one of its destinations is, so the
// union of its items' actions is the same question the items ask one by one.
const GroupHeading = ({ group }: { group: SidebarNavGroup }) => {
  const { isAuthorized } = RbacProtected.useRbac({
    action: group.items.flatMap((item) => item.actions),
  });

  if (!isAuthorized) return null;

  return (
    <li
      role="presentation"
      className="px-8 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-foreground/40 dark:text-dark-foreground/40"
    >
      {group.label}
    </li>
  );
};

export const SidebarMenu = ({ className, collapsed }: SidebarMenuProps) => {
  const pathname = usePathname();
  const hyperdxUrl = useHyperdxUrl();
  const groups = buildSidebarMenuGroups(hyperdxUrl).filter(
    (group) => group.items.length > 0,
  );
  const menuItems = sidebarMenuItems(groups);
  // Segment-prefix match, longest key wins: '/observe/search/list' lights
  // Saved Searches alone, not Search as well.
  const matchesPath = (key: string) =>
    pathname === key || !!pathname?.startsWith(`${key}/`);
  const isSelected = (key: string) =>
    matchesPath(key) &&
    !menuItems.some(
      (other) => other.key.length > key.length && matchesPath(other.key),
    );

  return (
    <ul className={cn(collapsed ? 'max-w-24' : 'max-w-96', className)}>
      {groups.map((group) => (
        <Fragment key={group.label}>
          {/* Collapsed to icons there is no room for a heading, and the
              tooltip already names each destination. */}
          {!collapsed && <GroupHeading group={group} />}
          {group.items.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              collapsed={collapsed}
              selected={isSelected(item.key)}
            />
          ))}
        </Fragment>
      ))}
    </ul>
  );
};
