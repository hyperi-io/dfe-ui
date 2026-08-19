import {
  UI_DISPLAY_ACTIONS,
  type UI_DISPLAY_ACTIONS_TYPE,
} from './rbac.constants';

// The baseline permissions that unlock any usable area of dfe-ui: the gating
// action of every top-level nav destination plus the HyperDX query capability
// the lowest-access real user (org_viewer) carries. A user authorized for none
// of these has no usable surface and is shown the no-access page by AppLayout.
// Keep in step with the sidebar nav gating in SidebarMenu/constants.tsx.
export const APP_ACCESS_ACTIONS: readonly UI_DISPLAY_ACTIONS_TYPE[] = [
  // Observe (HyperDX embed) + direct query capability.
  UI_DISPLAY_ACTIONS.dashboard_read,
  UI_DISPLAY_ACTIONS.query_read,
  UI_DISPLAY_ACTIONS.query_execute,
  // Sources.
  UI_DISPLAY_ACTIONS.source_read,
  // Schemas.
  UI_DISPLAY_ACTIONS.schema_read,
  // Rules.
  UI_DISPLAY_ACTIONS.rule_read,
  // Hunts.
  UI_DISPLAY_ACTIONS.hunt_read,
  // Services.
  UI_DISPLAY_ACTIONS.service_read,
  // Settings.
  UI_DISPLAY_ACTIONS.org_read,
  UI_DISPLAY_ACTIONS.org_write,
  UI_DISPLAY_ACTIONS.org_delete,
  UI_DISPLAY_ACTIONS.account_read,
  UI_DISPLAY_ACTIONS.account_write,
  UI_DISPLAY_ACTIONS.account_delete,
  UI_DISPLAY_ACTIONS.role_read,
  UI_DISPLAY_ACTIONS.role_write,
  UI_DISPLAY_ACTIONS.role_delete,
  UI_DISPLAY_ACTIONS.group_read,
  UI_DISPLAY_ACTIONS.group_write,
  UI_DISPLAY_ACTIONS.group_delete,
  UI_DISPLAY_ACTIONS.oidc_read,
  UI_DISPLAY_ACTIONS.oidc_write,
  UI_DISPLAY_ACTIONS.oidc_delete,
  // Platform.
  UI_DISPLAY_ACTIONS.lifecycle_read,
];
