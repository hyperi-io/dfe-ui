import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useFeatureFlags } from './useFeatureFlags';

describe('useFeatureFlags', () => {
  beforeEach(() => {
    window.localStorage.setItem('featureFlags', JSON.stringify(['NEW_VIEW']));
  });

  afterEach(() => {
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
});
