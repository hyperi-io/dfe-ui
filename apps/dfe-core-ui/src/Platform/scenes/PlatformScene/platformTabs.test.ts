import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PLATFORM_TAB,
  isPlatformTabKey,
  PLATFORM_TAB_DETAILS,
  platformTabFromPathname,
  platformTabPath,
} from './platformTabs';

describe('platformTabs', () => {
  it.each(Object.values(PLATFORM_TAB_DETAILS).map((tab) => tab.key))(
    'opens the %s tab from its own path',
    (key) => {
      expect(isPlatformTabKey(key)).toBe(true);
      expect(platformTabFromPathname(platformTabPath(key))).toBe(key);
    },
  );

  it.each([
    ['an unknown tab', '/settings/platform/nope'],
    [
      'an object key that is not a URL segment',
      '/settings/platform/backingServices',
    ],
    ['another page', '/settings/accounts'],
  ])('falls back to the default tab for %s', (_name, pathname) => {
    expect(platformTabFromPathname(pathname)).toBe(DEFAULT_PLATFORM_TAB);
  });
});
