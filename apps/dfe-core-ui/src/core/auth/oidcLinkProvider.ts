import { authorizeEngineToken } from '@/core/auth/oidcTokenProvider';
import {
  OIDC_LINK_PATH,
  OIDC_LINK_PROVIDER_ID,
} from '@/core/config/oidcToken.constants';
import CredentialsProvider from 'next-auth/providers/credentials';

/* import-scope-drift-disable - (exported for tests) */
/**
 * Redeem a link ticket with its account's password, then sign in with the engine token that answers.
 * A refusal throws the engine's code, which the callback page words.
 */
export async function authorizeLink(
  ticket: string,
  password: string,
  baseUrl: string,
  headers: Record<string, string> = {},
  fetchImpl: typeof fetch = fetch,
) {
  if (!ticket || !password) return null;
  const linkRes = await fetchImpl(`${baseUrl}${OIDC_LINK_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ password, ticket }),
  });
  const body = (await linkRes.json().catch(() => null)) as {
    access_token?: unknown;
    code?: unknown;
  } | null;
  if (!linkRes.ok) {
    throw new Error(
      typeof body?.code === 'string' ? body.code : 'unauthorized',
    );
  }
  const token = typeof body?.access_token === 'string' ? body.access_token : '';
  return authorizeEngineToken(token, baseUrl, fetchImpl);
}
/* import-scope-drift-enable */

/** NextAuth provider for the callback page's link step: a held sign-in plus its account's password. */
export const oidcLinkProvider = (
  baseUrl: string,
  headersFor: (
    headers: Record<string, unknown> | undefined,
  ) => Record<string, string>,
) =>
  CredentialsProvider({
    id: OIDC_LINK_PROVIDER_ID,
    name: 'OIDC link',
    credentials: {
      ticket: { label: 'Ticket', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials, req) {
      return authorizeLink(
        credentials?.ticket ?? '',
        credentials?.password ?? '',
        baseUrl,
        headersFor(req?.headers),
      );
    },
  });
