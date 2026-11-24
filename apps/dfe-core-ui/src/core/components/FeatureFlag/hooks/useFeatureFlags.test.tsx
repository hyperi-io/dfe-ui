import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useFeatureFlagStore } from '@/core/stores/system/featureFlagStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { useFeatureFlags } from './useFeatureFlags';
import { server } from './useFeatureFlags.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
  useFeatureFlagStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const renderFlags = () => renderHook(() => useFeatureFlags(), { wrapper });

describe('useFeatureFlags', () => {
  beforeEach(() => {
    useFeatureFlagStore.getState().reset();
    window.localStorage.setItem('featureFlags', JSON.stringify(['NEW_VIEW']));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.removeItem('featureFlags');
  });

  it('should return the feature flags and isFeatureEnabled', async () => {
    const { result } = renderFlags();

    await waitFor(() => {
      expect(result.current.featureFlags).toEqual(['NEW_VIEW', 'NEW_VIEW_2']);
    });
    expect(result.current.isFeatureEnabled('NEW_VIEW')).toBe(true);
    expect(result.current.isFeatureEnabled('NEW_VIEW_2')).toBe(true);
  });

  it('should return false if the feature flag is not set', async () => {
    const { result } = renderFlags();

    await waitFor(() => {
      expect(result.current.featureFlags).toEqual(['NEW_VIEW', 'NEW_VIEW_2']);
    });
    expect(result.current.isFeatureEnabled('OLD_VIEW')).toBe(false);
  });

  it('includes API flags that are true', async () => {
    server.use(
      API_CONFIG_MOCKS.clientConfig.features.get.success({
        mockedResponse: {
          NEW_VIEW_2: true,
          rules_v2: true,
          disabled_flag: false,
        },
      }),
    );

    const { result } = renderFlags();

    await waitFor(() => {
      expect(result.current.featureFlags).toEqual([
        'NEW_VIEW',
        'NEW_VIEW_2',
        'rules_v2',
      ]);
    });
    expect(result.current.isFeatureEnabled('rules_v2')).toBe(true);
    expect(result.current.isFeatureEnabled('disabled_flag')).toBe(false);
  });

  it('reads as no flags when the browser blocks storage', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const { result } = renderFlags();

    await waitFor(() => {
      expect(result.current.featureFlags).toEqual(['NEW_VIEW_2']);
    });
    expect(result.current.isFeatureEnabled('NEW_VIEW')).toBe(false);
  });

  it.each([
    ['a number', '5'],
    ['null', 'null'],
    ['an object', '{"NEW_VIEW":true}'],
    ['a string', '"NEW_VIEW"'],
  ])('reads a stored value that is %s as no flags', async (_, raw) => {
    window.localStorage.setItem('featureFlags', raw);

    const { result } = renderFlags();

    await waitFor(() => {
      expect(result.current.featureFlags).toEqual(['NEW_VIEW_2']);
    });
    expect(result.current.isFeatureEnabled('NEW')).toBe(false);
  });
});
