/** Shared in-flight refresh so 401 handlers can wait instead of signing out mid-refresh. */
let accessTokenRefreshInFlight: Promise<unknown> | null = null;

export const getAccessTokenRefreshInFlight = (): Promise<unknown> | null =>
  accessTokenRefreshInFlight;

export const trackAccessTokenRefresh = <T>(promise: Promise<T>): Promise<T> => {
  const tracked = promise.finally(() => {
    if (accessTokenRefreshInFlight === tracked) {
      accessTokenRefreshInFlight = null;
    }
  });
  accessTokenRefreshInFlight = tracked;
  return tracked;
};
