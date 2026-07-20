export const PLATFORM_BASE_PATH = '/platform';

export const PLATFORM_TAB_DETAILS = Object.freeze({
  system: {
    key: 'system',
    label: 'System Settings',
    description: 'View Platform configuration data and restart cloud services',
  },
  gitops: {
    key: 'gitops',
    label: 'Git Operations',
    description: 'View Git Operations configuration data and logs',
  },
  governance: {
    key: 'governance',
    label: 'Governance',
    description: 'View and manage governance policies and actions',
  },
});

export const PLATFORM_TAB_KEYS = Object.keys(PLATFORM_TAB_DETAILS);

export type PlatformTabKey = (typeof PLATFORM_TAB_KEYS)[number];

export const DEFAULT_PLATFORM_TAB: PlatformTabKey = 'system';

export const isPlatformTabKey = (
  value: string | null,
): value is PlatformTabKey =>
  value !== null && (PLATFORM_TAB_KEYS as readonly string[]).includes(value);

export const platformTabPath = (tab: PlatformTabKey) =>
  tab === DEFAULT_PLATFORM_TAB
    ? PLATFORM_BASE_PATH
    : `${PLATFORM_BASE_PATH}/${tab}`;

export const platformTabFromPathname = (pathname: string): PlatformTabKey => {
  if (
    pathname === PLATFORM_BASE_PATH ||
    pathname === `${PLATFORM_BASE_PATH}/`
  ) {
    return DEFAULT_PLATFORM_TAB;
  }

  if (!pathname.startsWith(`${PLATFORM_BASE_PATH}/`)) {
    return DEFAULT_PLATFORM_TAB;
  }

  const segment = pathname.slice(`${PLATFORM_BASE_PATH}/`.length).split('/')[0];
  return isPlatformTabKey(segment) ? segment : DEFAULT_PLATFORM_TAB;
};
