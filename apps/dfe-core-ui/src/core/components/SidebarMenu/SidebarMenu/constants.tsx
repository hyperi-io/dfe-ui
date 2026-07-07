import { IconWrapper } from '@/core/components/IconWrapper';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SidebarLink } from '@/core/components/SidebarMenu/SidebarLink';
import {
  IconArrowBounce,
  IconChartDots,
  IconDatabase,
  IconLayoutGrid,
  IconSettings2,
  IconShieldCheck,
  IconTable,
  IconTargetArrow,
} from '@repo/dfe-icons';

const { rbacActions } = RbacProtected;

interface SidebarMenuProps {
  collapsed: boolean;
  isNewViewEnabled?: boolean;
}

export const buildFeatureFlagSidebarMenuItems = (hyperdxUrl?: string) => [
  ...(hyperdxUrl
    ? [
        {
          key: `${hyperdxUrl}/search`,
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: `${hyperdxUrl}/search`,
                    icon: <IconWrapper icon={<IconTable />} />,
                    label: 'Search',
                    external: true,
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
                    key: `${hyperdxUrl}/search`,
                    icon: <IconWrapper icon={<IconTable />} />,
                    label: 'Search',
                    external: true,
                  }}
                />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },
        {
          key: `${hyperdxUrl}/chart`,
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: `${hyperdxUrl}/chart`,
                    icon: <IconWrapper icon={<IconChartDots />} />,
                    label: 'Chart Explorer',
                    external: true,
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
                    key: `${hyperdxUrl}/chart`,
                    icon: <IconWrapper icon={<IconChartDots />} />,
                    label: 'Chart Explorer',
                    external: true,
                  }}
                />
              </RbacProtected.Restricted>
            </RbacProtected>
          ),
        },
        {
          key: `${hyperdxUrl}/dashboards`,
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: `${hyperdxUrl}/dashboards`,
                    icon: <IconWrapper icon={<IconLayoutGrid />} />,
                    label: 'Dashboards',
                    external: true,
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
                    key: `${hyperdxUrl}/dashboards`,
                    icon: <IconWrapper icon={<IconLayoutGrid />} />,
                    label: 'Dashboards',
                    external: true,
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
          rbacActions.account_read,
          rbacActions.role_read,
          rbacActions.group_read,
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
];
