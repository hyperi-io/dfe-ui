/** App routes under `(no-auth)` where missing API credentials are expected. */
export function isNoAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/login') || pathname.startsWith('/setup');
}
