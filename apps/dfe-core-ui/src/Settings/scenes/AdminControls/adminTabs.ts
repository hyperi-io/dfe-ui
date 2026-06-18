export const ADMIN_BASE_PATH = '/settings/admin';

export const ADMIN_TAB_KEYS = [
  'organization-management',
  'role-management',
  'group-management',
  'user-management',
] as const;

export type AdminTabKey = (typeof ADMIN_TAB_KEYS)[number];

export const DEFAULT_ADMIN_TAB: AdminTabKey = 'organization-management';

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
