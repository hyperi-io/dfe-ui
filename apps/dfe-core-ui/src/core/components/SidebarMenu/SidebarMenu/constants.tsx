import { RbacProtected } from '@/core/components/RbacProtected';
import type { UI_DISPLAY_ACTIONS_TYPE } from '@/core/components/RbacProtected/hooks/rbac.constants';
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
  IconShieldCheck,
  IconStack2,
  IconTable,
  IconTargetArrow,
  IconUsersGroup,
  type IconComponent,
} from '@repo/dfe-icons';

const { rbacActions } = RbacProtected;

/** One destination in the sidebar. */
export interface SidebarNavItem {
  /** Route it links to, and the key selection matches the pathname against. */
  key: string;
  label: string;
  icon: React.ReactElement<IconComponent & { className?: string }>;
  /** Any one of these authorises the entry; without one it is hidden. */
  actions: UI_DISPLAY_ACTIONS_TYPE[];
}

/** A stage of the flow, and the destinations that belong to it. */
export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

// HyperDX features embedded as siblings via /observe/* (an iframe of the
// chromeless fork -- dfe-ui owns the nav). They route INTERNALLY to the embed
// page, which iframes `${hyperdxUrl}/<feature>?embed=1`, so they appear only
// once a HyperDX URL is configured.
const observeItems = (hyperdxUrl?: string): SidebarNavItem[] =>
  hyperdxUrl
    ? [
        {
          key: '/observe/search',
          label: 'Search',
          icon: <IconTable />,
          actions: [rbacActions.dashboard_read],
        },
        {
          key: '/observe/search/list',
          label: 'Saved Searches',
          icon: <IconBookmark />,
          actions: [rbacActions.dashboard_read],
        },
        {
          key: '/observe/chart',
          label: 'Chart Explorer',
          icon: <IconChartDots />,
          actions: [rbacActions.dashboard_read],
        },
        {
          key: '/observe/dashboards',
          label: 'Dashboards',
          icon: <IconLayoutGrid />,
          actions: [rbacActions.dashboard_read],
        },
        // Hunt Results is a saved-search view over dfe.detection, so it sits
        // with the dashboards it reads like, last of the observe group.
        {
          key: '/observe/hunt-results',
          label: 'Hunt Results',
          icon: <IconRadar />,
          actions: [rbacActions.dashboard_read],
        },
      ]
    : [];

/**
 * The sidebar, grouped in the order a record travels.
 *
 * Observe is where the data is looked at; Data flow defines what comes in, how
 * it is shaped and where it lands; Detect defines what to look for; Stack is
 * what is running; Access is who may do what. Each group is one RBAC family, so
 * a user sees a heading exactly when at least one destination under it is
 * theirs.
 *
 * Entries are DATA. One renderer draws every one of them, so a destination is a
 * row added here rather than another copy of the RbacProtected wrapper.
 */
export const buildSidebarMenuGroups = (
  hyperdxUrl?: string,
): SidebarNavGroup[] => [
  {
    label: 'Observe',
    items: observeItems(hyperdxUrl),
  },
  {
    label: 'Data flow',
    items: [
      {
        key: '/sources',
        label: 'Sources',
        icon: <IconArrowBounce />,
        actions: [
          rbacActions.source_read,
          rbacActions.source_write,
          rbacActions.source_delete,
        ],
      },
      {
        key: '/schemas',
        label: 'Meta Schemas',
        icon: <IconDatabase />,
        actions: [
          rbacActions.schema_read,
          rbacActions.schema_write,
          rbacActions.schema_delete,
        ],
      },
      {
        key: '/library',
        label: 'Library',
        icon: <IconBooks />,
        actions: [rbacActions.library_read, rbacActions.library_write],
      },
    ],
  },
  {
    label: 'Detect',
    items: [
      {
        key: '/rules',
        label: 'Rules',
        icon: <IconShieldCheck />,
        actions: [
          rbacActions.rule_read,
          rbacActions.rule_write,
          rbacActions.rule_delete,
        ],
      },
      {
        key: '/hunts',
        label: 'Hunts',
        icon: <IconTargetArrow />,
        actions: [
          rbacActions.hunt_read,
          rbacActions.hunt_write,
          rbacActions.hunt_delete,
        ],
      },
    ],
  },
  {
    label: 'Stack',
    items: [
      {
        key: '/components',
        label: 'Components',
        icon: <IconServer2 />,
        actions: [
          rbacActions.deployment_read,
          rbacActions.helmvars_read,
          rbacActions.helmvars_write,
        ],
      },
      {
        key: '/services',
        label: 'Services',
        icon: <IconCode />,
        actions: [
          rbacActions.service_read,
          rbacActions.service_write,
          rbacActions.service_delete,
          rbacActions.deployment_read,
          rbacActions.deployment_write,
          rbacActions.deployment_delete,
          rbacActions.service_surface_read,
          rbacActions.service_surface_write,
        ],
      },
      {
        key: '/platform',
        label: 'Platform',
        icon: <IconStack2 />,
        actions: [
          rbacActions.lifecycle_read,
          rbacActions.config_write,
          rbacActions.helmvars_read,
          rbacActions.helmvars_write,
          rbacActions.governance_read,
          rbacActions.governance_write,
        ],
      },
    ],
  },
  {
    label: 'Access',
    items: [
      {
        key: '/settings',
        label: 'Settings',
        icon: <IconUsersGroup />,
        actions: [
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
        ],
      },
    ],
  },
];

/** Every destination, ungrouped -- what selection matches a pathname against. */
export const sidebarMenuItems = (groups: SidebarNavGroup[]): SidebarNavItem[] =>
  groups.flatMap((group) => group.items);
