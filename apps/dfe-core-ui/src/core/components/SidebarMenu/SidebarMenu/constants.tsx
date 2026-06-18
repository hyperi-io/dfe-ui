import { IconWrapper } from '@/core/components/IconWrapper';
import { SidebarLink } from '@/core/components/SidebarMenu/SidebarLink';
import {
  IconArrowBounce,
  IconChartDots,
  IconCode,
  IconDatabase,
  IconLayoutGrid,
  IconRotate2,
  IconSettings2,
  IconShieldCheck,
  IconTable,
  IconTransform,
} from '@repo/dfe-icons';

interface SidebarMenuProps {
  collapsed: boolean;
  isNewViewEnabled?: boolean;
}

const hyperdxUrl = process.env.NEXT_PUBLIC_HYPERDX_URL as string | undefined;

export const featureFlagSidebarMenuItems = [
  ...(hyperdxUrl
    ? [
        {
          key: `${hyperdxUrl}/search`,
          Component: ({ collapsed }: SidebarMenuProps) => (
            <SidebarLink
              collapsed={collapsed}
              item={{
                key: `${hyperdxUrl}/search`,
                icon: <IconWrapper icon={<IconTable />} />,
                label: 'Search',
                external: true,
              }}
            />
          ),
        },
        {
          key: `${hyperdxUrl}/chart`,
          Component: ({ collapsed }: SidebarMenuProps) => (
            <SidebarLink
              collapsed={collapsed}
              item={{
                key: `${hyperdxUrl}/chart`,
                icon: <IconWrapper icon={<IconChartDots />} />,
                label: 'Chart Explorer',
                external: true,
              }}
            />
          ),
        },
        {
          key: `${hyperdxUrl}/dashboards`,
          Component: ({ collapsed }: SidebarMenuProps) => (
            <SidebarLink
              collapsed={collapsed}
              item={{
                key: `${hyperdxUrl}/dashboards`,
                icon: <IconWrapper icon={<IconLayoutGrid />} />,
                label: 'Dashboards',
                external: true,
              }}
            />
          ),
        },
      ]
    : []),
  {
    key: '/sources',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/sources',
          icon: <IconWrapper icon={<IconArrowBounce />} />,
          label: 'Sources',
          external: false,
        }}
      />
    ),
  },
  {
    key: '/schemas',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/schemas',
          icon: <IconWrapper icon={<IconDatabase />} />,
          label: 'Schemas',
          external: false,
        }}
      />
    ),
  },

  {
    key: '/rules',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/rules',
          icon: <IconWrapper icon={<IconShieldCheck />} />,
          label: 'Rules',
          external: false,
        }}
      />
    ),
  },
  {
    key: '/field-maps',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/field-maps',
          icon: <IconWrapper icon={<IconRotate2 />} />,
          label: 'Field Maps',
          external: false,
        }}
      />
    ),
  },
  {
    key: '/transforms',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/transforms',
          icon: <IconWrapper icon={<IconTransform />} />,
          label: 'Transforms',
          external: false,
        }}
      />
    ),
  },
  {
    key: '/services',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/services',
          icon: <IconWrapper icon={<IconCode />} />,
          label: 'Services',
          external: false,
        }}
      />
    ),
  },
  {
    key: '/settings',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/settings',
          icon: <IconWrapper icon={<IconSettings2 />} />,
          label: 'Settings',
          external: false,
        }}
      />
    ),
  },
];
