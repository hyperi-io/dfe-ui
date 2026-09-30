/** Request header set by proxy so server layouts can build a login callback URL. */
export const LOGIN_CALLBACK_PATH_HEADER = 'x-dfe-callback-path';

export const pathWithSearch = (pathname: string, search = ''): string =>
  `${pathname}${search}`;

export const loginRedirectPath = (callbackPath: string): string => {
  const path = callbackPath.startsWith('/') ? callbackPath : `/${callbackPath}`;
  return `/login?callbackUrl=${encodeURIComponent(path)}`;
};

/** Path + query (+ hash) for client router navigation after auth. */
export const clientNavigationPathFromAuthUrl = (url: string): string => {
  if (!url.startsWith('http')) {
    return url;
  }
  const parsed = new URL(url);
  return pathWithSearch(parsed.pathname, `${parsed.search}${parsed.hash}`);
};

// Stands in for the origin where the caller has none, so only a relative path resolves onto it.
const RELATIVE_ONLY_ORIGIN = 'http://console.invalid';

/**
 * Every post-login redirect goes through here: the target resolved against
 * `origin` must stay on it, and anything else ('//host', '/\host', another
 * scheme) becomes '/'.
 */
export const safeRedirectPath = (
  candidate: string | null | undefined,
  origin: string = RELATIVE_ONLY_ORIGIN,
): string => {
  if (!candidate) {
    return '/';
  }
  let base: string;
  let resolved: URL;
  try {
    base = new URL(origin).origin;
    resolved = new URL(candidate, base);
  } catch {
    return '/';
  }
  if (resolved.origin !== base) {
    return '/';
  }
  const path = pathWithSearch(
    resolved.pathname,
    `${resolved.search}${resolved.hash}`,
  );
  // A pathname can normalise to '//host', which leaves the origin when followed.
  return new URL(path, base).origin === base ? path : '/';
};
