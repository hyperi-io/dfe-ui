import { IconWrapper } from '@/core/components/IconWrapper';
import { SidebarLink } from '@/core/components/SidebarMenu/SidebarLink';
import {
  IconArrowBounce,
  IconChartDots,
  IconDatabase,
  IconLayoutGrid,
  IconTable,
  IconShieldCheck as SafetyCertificateOutlined,
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
          icon: <IconWrapper icon={<SafetyCertificateOutlined />} />,
          label: 'Rules',
          external: false,
        }}
      />
    ),
  },
  // TODO: Add back once field maps view is implemented
  // {
  //   key: '/settings',
  //   Component: ({ collapsed }: SidebarMenuProps) => (
  //     <SidebarLink
  //       collapsed={collapsed}
  //       item={{
  //         key: '/settings',
  //         icon: <IconWrapper icon={<IconSettings />} />,
  //         label: 'Settings',
  //         external: false,
  //       }}
  //     />
  //   ),
  // },
];
