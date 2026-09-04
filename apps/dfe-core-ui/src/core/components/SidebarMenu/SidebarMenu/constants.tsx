import { IconWrapper } from '@/core/components/IconWrapper';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SidebarLink } from '@/core/components/SidebarMenu/SidebarLink';
import {
  IconArrowBounce,
  IconBookmark,
  IconBooks,
  IconChartDots,
  IconCode,
  IconDatabase,
  IconLayoutGrid,
  IconRadar,
  IconServer2,
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

// Unpermitted nav items are hidden, not greyed: each renders only inside
// RbacProtected.Unrestricted, with no Restricted fallback. AppLayout's
// no-access guard covers a user for whom none would render.
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
            </RbacProtected>
          ),
        },
        // Hunt Results is a saved-search view over dfe.detection, so it sits with
        // the dashboards it reads like, last of the observe group.
        {
          key: '/observe/hunt-results',
          Component: ({ collapsed }: SidebarMenuProps) => (
            <RbacProtected action={rbacActions.dashboard_read}>
              <RbacProtected.Unrestricted>
                <SidebarLink
                  collapsed={collapsed}
                  item={{
                    key: '/observe/hunt-results',
                    icon: <IconWrapper icon={<IconRadar />} />,
                    label: 'Hunt Results',
                    external: false,
                  }}
                />
              </RbacProtected.Unrestricted>
            </RbacProtected>
          ),
        },
      ]
    : []),
  {
    key: '/sources',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.source_read,
          rbacActions.source_write,
          rbacActions.source_delete,
        ]}
      >
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
      </RbacProtected>
    ),
  },
  {
    key: '/schemas',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.schema_read,
          rbacActions.schema_write,
          rbacActions.schema_delete,
        ]}
      >
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/schemas',
              icon: <IconWrapper icon={<IconDatabase />} />,
              label: 'Meta Schemas',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
      </RbacProtected>
    ),
  },

  {
    key: '/rules',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.rule_read,
          rbacActions.rule_write,
          rbacActions.rule_delete,
        ]}
      >
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
      </RbacProtected>
    ),
  },
  {
    key: '/hunts',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.hunt_read,
          rbacActions.hunt_write,
          rbacActions.hunt_delete,
        ]}
      >
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
  {
    key: '/components',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.deployment_read,
          rbacActions.helmvars_read,
          rbacActions.helmvars_write,
        ]}
      >
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/components',
              icon: <IconWrapper icon={<IconServer2 />} />,
              label: 'Components',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
      </RbacProtected>
    ),
  },
  {
    key: '/library',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[rbacActions.library_read, rbacActions.library_write]}
      >
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/library',
              icon: <IconWrapper icon={<IconBooks />} />,
              label: 'Library',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
      </RbacProtected>
    ),
  },
  {
    key: '/services',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.service_read,
          rbacActions.service_write,
          rbacActions.service_delete,
          rbacActions.deployment_read,
          rbacActions.deployment_write,
          rbacActions.deployment_delete,
          rbacActions.service_surface_read,
          rbacActions.service_surface_write,
        ]}
      >
        <RbacProtected.Unrestricted>
          <SidebarLink
            collapsed={collapsed}
            item={{
              key: '/services',
              icon: <IconWrapper icon={<IconCode />} />,
              label: 'Services',
              external: false,
            }}
          />
        </RbacProtected.Unrestricted>
      </RbacProtected>
    ),
  },
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
          rbacActions.api_key_read,
          rbacActions.api_key_write,
          rbacActions.api_key_delete,
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
      </RbacProtected>
    ),
  },
  {
    key: '/platform',
    Component: ({ collapsed }: SidebarMenuProps) => (
      <RbacProtected
        action={[
          rbacActions.lifecycle_read,
          rbacActions.config_write,
          rbacActions.helmvars_read,
          rbacActions.helmvars_write,
          rbacActions.governance_read,
          rbacActions.governance_write,
        ]}
      >
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
      </RbacProtected>
    ),
  },
];
