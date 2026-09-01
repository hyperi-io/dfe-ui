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
