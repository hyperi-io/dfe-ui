import { IconWrapper } from '@/core/components/IconWrapper';
import {
  IconChartDots,
  IconDatabase,
  IconLayoutGrid,
  IconSettings,
  IconTable,
  IconShieldCheck as SafetyCertificateOutlined,
} from '@dfe/icons';
import { SidebarLink } from '../SidebarLink';

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
          icon: <IconWrapper icon={<IconDatabase />} />,
          label: 'Sources',
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
          icon: <IconWrapper icon={<SafetyCertificateOutlined />} />,
          label: 'Rules',
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
          icon: <IconWrapper icon={<IconSettings />} />,
          label: 'Settings',
          external: false,
        }}
      />
    ),
  },
];
