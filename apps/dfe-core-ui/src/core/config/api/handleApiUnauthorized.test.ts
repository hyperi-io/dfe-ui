import { trackAccessTokenRefresh } from '@/core/auth/accessTokenRefreshFlight';
import { handleApiUnauthorized } from '@/core/config/api/handleApiUnauthorized';
import { afterEach, describe, expect, test, vi } from 'vitest';

const signOutMock = vi.fn().mockResolvedValue(undefined);
const executeAccessTokenRefreshMock = vi
  .fn()
  .mockRejectedValue(new Error('refresh failed'));

vi.mock('next-auth/react', () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

vi.mock('@/core/auth/refreshAccessToken', () => ({
  executeAccessTokenRefresh: () => executeAccessTokenRefreshMock(),
}));

describe('handleApiUnauthorized', () => {
  afterEach(() => {
    signOutMock.mockClear();
    executeAccessTokenRefreshMock.mockClear();
    executeAccessTokenRefreshMock.mockRejectedValue(
      new Error('refresh failed'),
    );
  });

  test('does not sign out while access token refresh is in flight', async () => {
    let resolveRefresh!: () => void;
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });
    trackAccessTokenRefresh(refreshPromise);

    const unauthorized = handleApiUnauthorized();
    await Promise.resolve();
    expect(signOutMock).not.toHaveBeenCalled();
    expect(executeAccessTokenRefreshMock).not.toHaveBeenCalled();

    resolveRefresh();
    await unauthorized;
    expect(signOutMock).not.toHaveBeenCalled();
  });

  test('does not sign out when refresh in flight fails', async () => {
    trackAccessTokenRefresh(Promise.reject(new Error('refresh failed')));

    await handleApiUnauthorized();
    expect(signOutMock).not.toHaveBeenCalled();
    expect(executeAccessTokenRefreshMock).not.toHaveBeenCalled();
  });

  test('signs out when refresh is not in flight and recovery fails', async () => {
    window.history.replaceState({}, '', '/settings');
    await handleApiUnauthorized();
    expect(executeAccessTokenRefreshMock).toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalled();
  });

  test('signs out on setup wizard routes, which run behind the login', async () => {
    // Returning early here left a dead engine token in place with nothing to
    // clear it, stranding the operator on a wizard whose every call 401s.
    window.history.replaceState({}, '', '/setup/welcome');
    await handleApiUnauthorized();
    expect(executeAccessTokenRefreshMock).toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalled();
  });

  test('does not sign out on the login page', async () => {
    window.history.replaceState({}, '', '/login');
    await handleApiUnauthorized();
    expect(signOutMock).not.toHaveBeenCalled();
  });
});
