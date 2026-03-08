import { IconWrapper } from '@/core/components/IconWrapper';
import {
  IconFocus2 as AimOutlined,
  IconDatabase as DatabaseOutlined,
  IconFilter as FilterOutlined,
  IconChartDots,
  IconLayoutGrid,
  IconTable,
  IconShieldCheck as SafetyCertificateOutlined,
  IconSettings as SettingOutlined,
} from '@hyperi/icons';
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
    key: '/schemas',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/schemas',
          icon: <IconWrapper icon={<DatabaseOutlined />} />,
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
          icon: <IconWrapper icon={<SafetyCertificateOutlined />} />,
          label: 'Rules',
          external: false,
        }}
      />
    ),
  },
  {
    key: '/hunts',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/hunts',
          icon: <IconWrapper icon={<AimOutlined />} />,
          label: 'Hunts',
          external: false,
        }}
      />
    ),
  },
  {
    key: '/ingest',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <SidebarLink
        collapsed={collapsed}
        item={{
          key: '/ingest',
          icon: <IconWrapper icon={<FilterOutlined />} />,
          label: 'Ingest',
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
          icon: <IconWrapper icon={<SettingOutlined />} />,
          label: 'Settings',
          external: false,
        }}
      />
    ),
  },
];
