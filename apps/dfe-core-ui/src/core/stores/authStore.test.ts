import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { SESSION_AUTH_REFRESH_INTERVAL_MS } from '@/core/config/authSession';
import { server } from '@/core/hooks/useAuthMe/useAuthMe.mocks';
import { useAuthStore } from '@/core/stores/authStore';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

const defaultMeResponse = {
  org_id: 'string',
  user_id: 'string',
  roles: ['string'],
  permissions: ['string'],
  groups: ['string'],
};

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);

afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
  vi.useRealTimers();
});

describe('useAuthStore', () => {
  test('refreshAuth fetches me once when called in parallel', async () => {
    let meRequestCount = 0;
    server.use(
      http.get(API_CONFIG_MOCKS.auth.me.mockedUrl, () => {
        meRequestCount += 1;
        return HttpResponse.json(defaultMeResponse);
      }),
    );

    const { refreshAuth } = useAuthStore.getState();
    await Promise.all([
      refreshAuth({ force: true }),
      refreshAuth({ force: true }),
    ]);

    expect(meRequestCount).toBe(1);
    expect(useAuthStore.getState().me).not.toBeNull();
  });

  test('fetchMe skips duplicate calls within refresh interval', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));

    let meRequestCount = 0;
    server.use(
      http.get(API_CONFIG_MOCKS.auth.me.mockedUrl, () => {
        meRequestCount += 1;
        return HttpResponse.json(defaultMeResponse);
      }),
    );

    const { fetchMe } = useAuthStore.getState();
    await fetchMe({ force: true });
    await fetchMe({ force: false });

    expect(meRequestCount).toBe(1);

    vi.advanceTimersByTime(SESSION_AUTH_REFRESH_INTERVAL_MS);
    await fetchMe({ force: false });

    expect(meRequestCount).toBe(2);
  });

  test('refreshAuth updates me timestamp', async () => {
    server.use(API_CONFIG_MOCKS.auth.me.get.success());

    await useAuthStore.getState().refreshAuth({ force: true });

    expect(useAuthStore.getState().meLastFetchedAt).not.toBeNull();
    expect(useAuthStore.getState().me?.user_id).toBe('string');
  });

  test('fetchMe does not set meLoading during background refresh', async () => {
    server.use(API_CONFIG_MOCKS.auth.me.get.success());

    await useAuthStore.getState().fetchMe({ force: true });
    expect(useAuthStore.getState().meLoading).toBe(false);

    let meLoadingDuringRequest = false;
    server.use(
      http.get(API_CONFIG_MOCKS.auth.me.mockedUrl, async () => {
        meLoadingDuringRequest = useAuthStore.getState().meLoading;
        return HttpResponse.json(defaultMeResponse);
      }),
    );

    await useAuthStore.getState().fetchMe({ force: true });

    expect(meLoadingDuringRequest).toBe(false);
    expect(useAuthStore.getState().meLoading).toBe(false);
  });
});
