/**
 * App routes where missing API credentials are expected.
 *
 * `/setup` is NOT one: the wizard runs behind the login and every step it
 * renders calls the engine, so it must refresh its token and sign out on a 401
 * like any other page. Counting it here left a dead token in place with nothing
 * to clear it, and the operator stuck on a wizard that 401s.
 */
export function isNoAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/login');
}
