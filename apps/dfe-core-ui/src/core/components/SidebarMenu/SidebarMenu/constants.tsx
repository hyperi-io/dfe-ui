import { IconWrapper } from '@/core/components/IconWrapper';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SidebarLink } from '@/core/components/SidebarMenu/SidebarLink';
import {
  IconArrowBounce,
  IconBookmark,
  IconChartDots,
  IconDatabase,
  IconLayoutGrid,
  IconSettings2,
  IconShieldCheck,
  IconStack2,
  IconTable,
  IconTargetArrow,
} from '@repo/dfe-icons';

const { rbacActions } = RbacProtected;

interface SidebarMenuProps {
  collapsed: boolean;
  isNewViewEnabled?: boolean;
}

export const buildFeatureFlagSidebarMenuItems = (hyperdxUrl?: string) => [
  // HyperDX features embedded as seamless siblings via /observe/* (an iframe of
  // the chromeless fork -- dfe-ui owns the nav). These route INTERNALLY
  // (external: false) to the embed page, which iframes
  // `${hyperdxUrl}/<feature>?embed=1`. Gated on hyperdxUrl being configured +
  // the dashboard_read RBAC action.
  ...(hyperdxUrl
    ? [
        {
          key: '/observe/search',
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: '/observe/search',
                    icon: <IconWrapper icon={<IconTable />} />,
                    label: 'Search',
                    external: false,
                  }}
                />
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted
                tooltip={{ show: true, placement: 'right', showIcon: true }}
              >
                <SidebarLink
                  collapsed={collapsed}
                  disabled
                  item={{
                    key: '/observe/search',
                    icon: <IconWrapper icon={<IconTable />} />,
                    label: 'Search',
                    external: false,
                  }}
                />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },
        {
          key: '/observe/search/list',
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: '/observe/search/list',
                    icon: <IconWrapper icon={<IconBookmark />} />,
                    label: 'Saved Searches',
                    external: false,
                  }}
                />
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted
                tooltip={{ show: true, placement: 'right', showIcon: true }}
              >
                <SidebarLink
                  collapsed={collapsed}
                  disabled
                  item={{
                    key: '/observe/search/list',
                    icon: <IconWrapper icon={<IconBookmark />} />,
                    label: 'Saved Searches',
                    external: false,
                  }}
                />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },
        {
          key: '/observe/chart',
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: '/observe/chart',
                    icon: <IconWrapper icon={<IconChartDots />} />,
                    label: 'Chart Explorer',
                    external: false,
                  }}
                />
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted
                tooltip={{ show: true, placement: 'right', showIcon: true }}
              >
                <SidebarLink
                  collapsed={collapsed}
                  disabled
                  item={{
                    key: '/observe/chart',
                    icon: <IconWrapper icon={<IconChartDots />} />,
                    label: 'Chart Explorer',
                    external: false,
                  }}
                />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },
        {
          key: '/observe/dashboards',
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: '/observe/dashboards',
                    icon: <IconWrapper icon={<IconLayoutGrid />} />,
                    label: 'Dashboards',
                    external: false,
                  }}
                />
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted
                tooltip={{ show: true, placement: 'right', showIcon: true }}
              >
                <SidebarLink
                  collapsed={collapsed}
                  disabled
                  item={{
                    key: '/observe/dashboards',
                    icon: <IconWrapper icon={<IconLayoutGrid />} />,
                    label: 'Dashboards',
                    external: false,
                  }}
                />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },
      ]
    : []),
  {
    key: '/sources',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected action={rbacActions.source_read}>
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/sources',
              icon: <IconWrapper icon={<IconArrowBounce />} />,
              label: 'Sources',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'right', showIcon: true }}
        >
          <SidebarLink
            collapsed={collapsed}
            disabled
            item={{
              key: '/sources',
              icon: <IconWrapper icon={<IconArrowBounce />} />,
              label: 'Sources',
              external: false,
            }}
          />
        </RbacProtected.Restricted>
      </RbacProtected>
    ),
  },
  {
    key: '/schemas',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected action={rbacActions.schema_read}>
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/schemas',
              icon: <IconWrapper icon={<IconDatabase />} />,
              label: 'Schemas',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'right', showIcon: true }}
        >
          <SidebarLink
            collapsed={collapsed}
            disabled
            item={{
              key: '/schemas',
              icon: <IconWrapper icon={<IconDatabase />} />,
              label: 'Schemas',
              external: false,
            }}
          />
        </RbacProtected.Restricted>
      </RbacProtected>
    ),
  },

  {
    key: '/rules',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected action={rbacActions.rule_read}>
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/rules',
              icon: <IconWrapper icon={<IconShieldCheck />} />,
              label: 'Rules',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'right', showIcon: true }}
        >
          <SidebarLink
            collapsed={collapsed}
            disabled
            item={{
              key: '/rules',
              icon: <IconWrapper icon={<IconShieldCheck />} />,
              label: 'Rules',
              external: false,
            }}
          />
        </RbacProtected.Restricted>
      </RbacProtected>
    ),
  },
  {
    key: '/hunts',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected action={rbacActions.hunt_read}>
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/hunts',
              icon: <IconWrapper icon={<IconTargetArrow />} />,
              label: 'Hunts',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'right', showIcon: true }}
        >
          <SidebarLink
            collapsed={collapsed}
            disabled
            item={{
              key: '/hunts',
              icon: <IconWrapper icon={<IconTargetArrow />} />,
              label: 'Hunts',
              external: false,
            }}
          />
        </RbacProtected.Restricted>
      </RbacProtected>
    ),
  },
  // {
  //   key: '/field-maps',
  //   Component: ({ collapsed }: SidebarMenuProps) => (
  //     <RbacProtected action={rbacActions.fieldmap_read}>
  //       <RbacProtected.Unrestricted>
  //         <SidebarLink
  //           collapsed={collapsed}
  //           item={{
  //             key: '/field-maps',
  //             icon: <IconWrapper icon={<IconRotate2 />} />,
  //             label: 'Field Maps',
  //             external: false,
  //           }}
  //         />
  //       </RbacProtected.Unrestricted>
  //       <RbacProtected.Restricted
  //         tooltip={{ show: true, placement: 'right', showIcon: true }}
  //       >
  //         <SidebarLink
  //           collapsed={collapsed}
  //           disabled
  //           item={{
  //             key: '/field-maps',
  //             icon: <IconWrapper icon={<IconRotate2 />} />,
  //             label: 'Field Maps',
  //             external: false,
  //           }}
  //         />
  //       </RbacProtected.Restricted>
  //     </RbacProtected>
  //   ),
  // },
  // {
  //   key: '/transforms',
  //   Component: ({ collapsed }: SidebarMenuProps) => (
  //     <SidebarLink
  //       collapsed={collapsed}
  //       item={{
  //         key: '/transforms',
  //         icon: <IconWrapper icon={<IconTransform />} />,
  //         label: 'Transforms',
  //         external: false,
  //       }}
  //     />
  //   ),
  // },
  // {
  //   key: '/services',
  //   Component: ({ collapsed }: SidebarMenuProps) => (
  //     <RbacProtected action={rbacActions.service_read}>
  //       <RbacProtected.Unrestricted>
  //         <SidebarLink
  //           collapsed={collapsed}
  //           item={{
  //             key: '/services',
  //             icon: <IconWrapper icon={<IconCode />} />,
  //             label: 'Services',
  //             external: false,
  //           }}
  //         />
  //       </RbacProtected.Unrestricted>
  //       <RbacProtected.Restricted
  //         tooltip={{ show: true, placement: 'right', showIcon: true }}
  //       >
  //         <SidebarLink
  //           collapsed={collapsed}
  //           disabled
  //           item={{
  //             key: '/services',
  //             icon: <IconWrapper icon={<IconCode />} />,
  //             label: 'Services',
  //             external: false,
  //           }}
  //         />
  //       </RbacProtected.Restricted>
  //     </RbacProtected>
  //   ),
  // },
  {
    key: '/settings',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.org_read,
          rbacActions.org_write,
          rbacActions.org_delete,
          rbacActions.account_read,
          rbacActions.account_write,
          rbacActions.account_delete,
          rbacActions.role_read,
          rbacActions.role_write,
          rbacActions.role_delete,
          rbacActions.group_read,
          rbacActions.group_write,
          rbacActions.group_delete,
          rbacActions.oidc_read,
          rbacActions.oidc_write,
          rbacActions.oidc_delete,
        ]}
      >
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/settings',
              icon: <IconWrapper icon={<IconSettings2 />} />,
              label: 'Settings',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'right', showIcon: true }}
        >
          <SidebarLink
            collapsed={collapsed}
            disabled
            item={{
              key: '/settings',
              icon: <IconWrapper icon={<IconSettings2 />} />,
              label: 'Settings',
              external: false,
            }}
          />
        </RbacProtected.Restricted>
      </RbacProtected>
    ),
  },
  {
    key: '/platform',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected action={rbacActions.lifecycle_read}>
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/platform',
              icon: <IconWrapper icon={<IconStack2 />} />,
              label: 'Platform',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{ show: true, placement: 'right', showIcon: true }}
        >
          <SidebarLink
            collapsed={collapsed}
            disabled
            item={{
              key: '/platform',
              icon: <IconWrapper icon={<IconStack2 />} />,
              label: 'Platform',
              external: false,
            }}
          />
        </RbacProtected.Restricted>
      </RbacProtected>
    ),
  },
];
