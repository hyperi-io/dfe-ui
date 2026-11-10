export const PLATFORM_BASE_PATH = '/settings/platform';

export const PLATFORM_TAB_DETAILS = Object.freeze({
  system: {
    key: 'system',
    label: 'System Settings',
    description: 'View Platform configuration data and restart cloud services',
  },
  components: {
    key: 'components',
    label: 'Components',
    description: 'Configure the scaling and settings of each component',
  },
  backingServices: {
    key: 'backing-services',
    label: 'Backing Services',
    description: 'Scale the data layer, which grows but never shrinks',
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
  lifecycle: {
    key: 'lifecycle',
    label: 'Lifecycle',
    description: 'View and manage service lifecycle',
  },
  repository: {
    key: 'repository',
    label: 'Repository',
    description: 'View and manage repository preferences',
  },
  helm: {
    key: 'helm',
    label: 'Helm',
    description: 'View and manage Helm charts',
  },
});

// The URL segment and the tab's key are one value, so `backing-services` opens its tab
export const PLATFORM_TAB_KEYS = Object.values(PLATFORM_TAB_DETAILS).map(
  (tab) => tab.key,
);

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
