import { OIDC_TOKEN_PROVIDER_ID } from '@/core/config/oidcToken.constants';
import { authMePath } from '@/core/hooks/useAuthMe/api';
import { decodeJwt } from 'jose';
import CredentialsProvider from 'next-auth/providers/credentials';

/** Session user minted from an engine token the OIDC callback handed back. */
export type EngineTokenUser = {
  id: string;
  name: string;
  email?: string;
  accessToken: string;
  expiresIn: number;
  roles: string[];
};

const DEFAULT_EXPIRES_IN = 86400;

/**
 * Turn an engine token into a session user by asking the engine who it is.
 * The engine is the only verifier: a token it rejects on /auth/me is null here.
 */
export async function authorizeEngineToken(
  token: string,
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<EngineTokenUser | null> {
  if (!token) return null;

  const meRes = await fetchImpl(`${baseUrl}${authMePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (
    !meRes.ok ||
    !meRes.headers.get('content-type')?.includes('application/json')
  ) {
    return null;
  }
  const me = (await meRes.json()) as { user_id?: string; roles?: string[] };
  if (!me.user_id) return null;

  let email: string | undefined;
  let expiresIn = DEFAULT_EXPIRES_IN;
  try {
    const claims = decodeJwt(token);
    if (typeof claims.email === 'string' && claims.email) {
      email = claims.email;
    }
    if (typeof claims.exp === 'number') {
      const left = claims.exp - Math.floor(Date.now() / 1000);
      if (left > 0) expiresIn = left;
    }
  } catch {
    // The engine already accepted the token; the claims only refine the session.
  }

  return {
    id: me.user_id,
    name: email ?? me.user_id,
    email,
    accessToken: token,
    expiresIn,
    roles: me.roles ?? [],
  };
}

/**
 * NextAuth provider for the OIDC hand-back: the console's /login/oidc page
 * reads the engine token out of the URL fragment and signs in with it here.
 */
export const oidcTokenProvider = (baseUrl: string) =>
  CredentialsProvider({
    id: OIDC_TOKEN_PROVIDER_ID,
    name: 'OIDC token',
    credentials: { token: { label: 'Token', type: 'text' } },
    async authorize(credentials) {
      return authorizeEngineToken(credentials?.token ?? '', baseUrl);
    },
  });
