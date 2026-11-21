import { isUserAuthorized } from '@/core/components/RbacProtected/hooks/useRbac.helpers';
import { scopes } from '@repo/dfe-engine-types/scopes';

export const ADMIN_BASE_PATH = '/settings/admin';

export const ADMIN_TAB_DETAILS = Object.freeze({
  'organisation-management': {
    key: 'organisation-management',
    action: scopes.org_read,
    label: 'Organisation Management',
    description:
      'Add and remove organisations, manage organisation specific configurations and defaults.',
  },
  'role-management': {
    key: 'role-management',
    action: scopes.role_read,
    label: 'Role Management',
    description:
      'Manage roles and their permissions, configure custom roles and permissions.',
  },
  'group-management': {
    key: 'group-management',
    action: scopes.group_read,
    label: 'Group Management',
    description:
      'Manage groups and their members, configure custom groups and members.',
  },
  'account-management': {
    key: 'account-management',
    action: scopes.account_read,
    label: 'Account Management',
    description: 'Manage accounts and their default settings.',
  },
  'oidc-provider-management': {
    key: 'oidc-provider-management',
    action: scopes.oidc_read,
    label: 'OIDC Provider Management',
    description:
      'Add and remove OIDC providers, manage OIDC provider specific configurations and defaults.',
  },
  'api-key-management': {
    key: 'api-key-management',
    action: scopes.api_key_read,
    label: 'API Key Management',
    description: 'Manage API keys, create and revoke API keys.',
  },
});

export const ADMIN_TAB_KEYS = Object.keys(ADMIN_TAB_DETAILS);

export type AdminTabKey = (typeof ADMIN_TAB_KEYS)[number];

export const DEFAULT_ADMIN_TAB: AdminTabKey = 'organisation-management';

/** The permission a tab's page reads with: a caller without it does not see the tab. */
export const adminTabAction = (key: string): string | undefined =>
  Object.values(ADMIN_TAB_DETAILS).find((tab) => tab.key === key)?.action;

/** The tabs a caller with *permissions* sees, every tab while they are not yet known. */
export const shownAdminTabKeys = (permissions?: ReadonlySet<string>) =>
  ADMIN_TAB_KEYS.filter((key) => {
    const action = adminTabAction(key);
    return (
      !permissions ||
      (action !== undefined && isUserAuthorized(permissions, action))
    );
  });

export const isAdminTabKey = (value: string | null): value is AdminTabKey =>
  value !== null && (ADMIN_TAB_KEYS as readonly string[]).includes(value);

export const adminTabPath = (tab: AdminTabKey) =>
  tab === DEFAULT_ADMIN_TAB ? ADMIN_BASE_PATH : `${ADMIN_BASE_PATH}/${tab}`;

export const adminTabFromPathname = (pathname: string): AdminTabKey => {
  if (pathname === ADMIN_BASE_PATH || pathname === `${ADMIN_BASE_PATH}/`) {
    return DEFAULT_ADMIN_TAB;
  }

  if (!pathname.startsWith(`${ADMIN_BASE_PATH}/`)) {
    return DEFAULT_ADMIN_TAB;
  }

  const segment = pathname.slice(`${ADMIN_BASE_PATH}/`.length).split('/')[0];
  return isAdminTabKey(segment) ? segment : DEFAULT_ADMIN_TAB;
};
