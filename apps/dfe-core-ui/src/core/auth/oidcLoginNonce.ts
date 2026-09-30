/**
 * Binds an OIDC login to the browser tab that started it. The nonce rides the
 * engine's return URL and must match the one this tab stored, so a link carrying
 * someone else's token cannot sign this browser in.
 *
 * sessionStorage, not a cookie: it is scoped to this origin and tab, so a sibling
 * host under the shared cookie domain cannot plant a matching value.
 */

const STORAGE_KEY = 'dfe.oidcLoginNonce';

// Long enough for an IdP login with MFA, short enough that a stale tab cannot replay it.
const NONCE_TTL_MS = 10 * 60 * 1000;

type TStoredNonce = { nonce: string; expiresAt: number };

const sessionStore = (): Storage | null =>
  typeof window === 'undefined' ? null : window.sessionStorage;

/** 128 random bits as hex; getRandomValues works on a plain-http origin where randomUUID does not. */
export function createOidcLoginNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

/** Records the nonce of the login this tab is about to start; false when storage refuses it. */
export function rememberOidcLoginNonce(
  nonce: string,
  now: number = Date.now(),
): boolean {
  try {
    const store = sessionStore();
    if (!store) return false;
    const stored: TStoredNonce = { nonce, expiresAt: now + NONCE_TTL_MS };
    store.setItem(STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}

/** True only for the unexpired nonce this tab stored; the stored one is spent either way. */
export function consumeOidcLoginNonce(
  received: string | null | undefined,
  now: number = Date.now(),
): boolean {
  let raw: string | null;
  try {
    const store = sessionStore();
    if (!store) return false;
    raw = store.getItem(STORAGE_KEY);
    store.removeItem(STORAGE_KEY);
  } catch {
    return false;
  }
  if (!raw || !received) return false;

  let stored: Partial<TStoredNonce>;
  try {
    stored = JSON.parse(raw) as Partial<TStoredNonce>;
  } catch {
    return false;
  }
  return (
    typeof stored.nonce === 'string' &&
    stored.nonce === received &&
    typeof stored.expiresAt === 'number' &&
    now <= stored.expiresAt
  );
}
