import { type ReactElement } from 'react';

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
  IconTable,
} from '@repo/dfe-icons';

const { rbacActions } = RbacProtected;

interface SidebarMenuProps {
  collapsed: boolean;
  isNewViewEnabled?: boolean;
}

const hyperdxUrl = process.env.NEXT_PUBLIC_HYPERDX_URL as string | undefined;

// HyperDX features embedded as seamless siblings via /observe/* (an iframe of the
// chromeless fork -- dfe-ui owns the nav). These route INTERNALLY (external: false)
// to the embed page, which iframes `${hyperdxUrl}/<feature>?embed=1`. Gated on
// hyperdxUrl being configured + the dashboard_read RBAC action.
const hyperdxFeatures: { path: string; label: string; icon: ReactElement }[] = [
  { path: '/observe/search', label: 'Search', icon: <IconTable /> },
  {
    path: '/observe/search/list',
    label: 'Saved Searches',
    icon: <IconBookmark />,
  },
  { path: '/observe/chart', label: 'Chart Explorer', icon: <IconChartDots /> },
  {
    path: '/observe/dashboards',
    label: 'Dashboards',
    icon: <IconLayoutGrid />,
  },
];

const hyperdxSidebarItems = hyperdxUrl
  ? hyperdxFeatures.map(({ path, label, icon }) => ({
      key: path,
      Component: ({ collapsed }: SidebarMenuProps) => (
        <RbacProtected action={rbacActions.dashboard_read}>
          <RbacProtected.Unrestricted>
            <SidebarLink
              collapsed={collapsed}
              item={{
                key: path,
                icon: <IconWrapper icon={icon} />,
                label,
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
                key: path,
                icon: <IconWrapper icon={icon} />,
                label,
                external: false,
              }}
            />
          </RbacProtected.Restricted>
        </RbacProtected>
      ),
    }))
  : [];

export const featureFlagSidebarMenuItems = [
  ...hyperdxSidebarItems,
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
