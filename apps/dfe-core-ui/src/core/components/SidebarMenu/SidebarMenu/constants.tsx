import { RbacProtected } from '@/core/components/RbacProtected';
import type { UI_DISPLAY_ACTIONS_TYPE } from '@/core/components/RbacProtected/hooks/rbac.constants';
import {
  IconArrowBounce,
  IconArrowsExchange,
  IconBookmark,
  IconBooks,
  IconChartDots,
  IconDatabase,
  IconLayoutGrid,
  IconRadar,
  IconServer2,
  IconShieldCheck,
  IconTable,
  IconTargetArrow,
  IconTool,
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
      ]
    : [];

// The search over dfe.detection, listed under Detect beside the hunts that
// write it. It is a HyperDX embed, so it needs the HyperDX URL too.
const detectionItems = (hyperdxUrl?: string): SidebarNavItem[] =>
  hyperdxUrl
    ? [
        {
          key: '/observe/hunt-results',
          label: 'Detections',
          icon: <IconRadar />,
          actions: [rbacActions.dashboard_read],
        },
      ]
    : [];

/**
 * The sidebar: Observe first, then Data flow, Detect and Stack, one group per
 * stage of the flow.
 *
 * Observe is where the data is looked at. Data flow defines what comes in, how
 * it is transformed and where it lands. Detect defines what to look for, and
 * Stack is what is running. A user sees a heading exactly when at least one
 * destination under it is theirs. Detections is the one entry whose action
 * belongs to another group's family (dashboard_read, Observe's).
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
      ...detectionItems(hyperdxUrl),
      {
        key: '/field-maps',
        label: 'Field Maps',
        icon: <IconArrowsExchange />,
        actions: [
          rbacActions.fieldmap_read,
          rbacActions.fieldmap_write,
          rbacActions.fieldmap_delete,
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
        key: '/admin-tools',
        label: 'Admin Tools',
        icon: <IconTool />,
        actions: [rbacActions.deployment_admin_links_read],
      },
    ],
  },
];

/** Every destination, ungrouped -- what selection matches a pathname against. */
export const sidebarMenuItems = (groups: SidebarNavGroup[]): SidebarNavItem[] =>
  groups.flatMap((group) => group.items);
