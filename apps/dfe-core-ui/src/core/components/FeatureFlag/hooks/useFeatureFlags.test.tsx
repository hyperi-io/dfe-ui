import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFeatureFlags } from './useFeatureFlags';

describe('useFeatureFlags', () => {
  beforeEach(() => {
    window.localStorage.setItem('featureFlags', JSON.stringify(['NEW_VIEW']));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.removeItem('featureFlags');
  });

  it('should return the feature flags and isFeatureEnabled', () => {
    const { featureFlags, isFeatureEnabled } = useFeatureFlags();
    expect(featureFlags).toEqual(['NEW_VIEW']);
    expect(isFeatureEnabled('NEW_VIEW')).toBe(true);
  });

  it('should return false if the feature flag is not set', () => {
    const { featureFlags, isFeatureEnabled } = useFeatureFlags();
    expect(featureFlags).toEqual(['NEW_VIEW']);
    expect(isFeatureEnabled('OLD_VIEW')).toBe(false);
  });

  it('reads as no flags when the browser blocks storage', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const { featureFlags, isFeatureEnabled } = useFeatureFlags();

    expect(featureFlags).toEqual([]);
    expect(isFeatureEnabled('NEW_VIEW')).toBe(false);
  });

  it.each([
    ['a number', '5'],
    ['null', 'null'],
    ['an object', '{"NEW_VIEW":true}'],
    ['a string', '"NEW_VIEW"'],
  ])('reads a stored value that is %s as no flags', (_, raw) => {
    window.localStorage.setItem('featureFlags', raw);

    const { featureFlags, isFeatureEnabled } = useFeatureFlags();

    expect(isFeatureEnabled('NEW')).toBe(false);
    expect(featureFlags).toEqual([]);
  });
});
