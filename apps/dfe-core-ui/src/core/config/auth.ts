import { oidcTokenProvider } from '@/core/auth/oidcTokenProvider';
import { ApiTimeoutError } from '@/core/config/api/client';
import {
  ENGINE_READ_DEADLINE_MS,
  ENGINE_WRITE_DEADLINE_MS,
} from '@/core/config/engineTimeout';
import { renewEngineSession } from '@/core/auth/renewEngineSession';
import { safeRedirectPath } from '@/core/config/loginCallback';
import { authMePath } from '@/core/hooks/useAuthMe/api';
import { loginPath } from '@/core/hooks/useLogin/api';
import { createLogger } from '@/core/server/logger';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/** The engine as the server reaches it; every server-side engine call starts here. */
export const engineBaseUrl =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';
const baseUrl = engineBaseUrl;

/* import-scope-drift-disable - (exported for tests) */
/** The browser's X-Forwarded-For chain, so the engine's login audit can name the client rather than this pod. */
export function forwardedForHeader(
  headers: Record<string, unknown> | undefined,
): Record<string, string> {
  const value = headers?.['x-forwarded-for'];
  const chain = Array.isArray(value) ? value.join(', ') : value;
  return typeof chain === 'string' && chain.trim() !== ''
    ? { 'X-Forwarded-For': chain.trim() }
    : {};
}
/* import-scope-drift-enable */

/** Local-account flow: POST /auth/login then GET /me for roles. */
const credentialsProvider = CredentialsProvider({
  name: 'Credentials',
  credentials: {
    username: { label: 'Username', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  // A thrown message reaches the login form, and a null reads as a wrong password.
  async authorize(credentials, req) {
    if (!credentials?.username || !credentials?.password) return null;
    let tokenData: {
      access_token: string;
      expires_in?: number;
      password_change_required?: boolean;
    };
    let roles: string[];
    let deadlineMs = ENGINE_WRITE_DEADLINE_MS;
    try {
      const loginRes = await fetch(`${baseUrl}${loginPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...forwardedForHeader(req?.headers),
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
        signal: AbortSignal.timeout(ENGINE_WRITE_DEADLINE_MS),
      });
      if (loginRes.status === 429) {
        const refusal = (await loginRes.json().catch(() => null)) as {
          message?: unknown;
        } | null;
        throw new Error(
          typeof refusal?.message === 'string'
            ? refusal.message
            : 'Too many failed attempts; try again later',
        );
      }
      if (!loginRes.ok) return null;
      tokenData = (await loginRes.json()) as typeof tokenData;

      deadlineMs = ENGINE_READ_DEADLINE_MS;
      const meRes = await fetch(`${baseUrl}${authMePath}`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        signal: AbortSignal.timeout(ENGINE_READ_DEADLINE_MS),
      });
      roles =
        meRes.ok &&
        meRes.headers.get('content-type')?.includes('application/json')
          ? (((await meRes.json()) as { roles?: string[] }).roles ?? [])
          : [];
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new ApiTimeoutError(deadlineMs, { cause: error });
      }
      throw error;
    }

    return {
      id: credentials.username,
      name: credentials.username,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in ?? 86400,
      roles,
      passwordChangeRequired: tokenData.password_change_required === true,
    };
  },
});

const authLogger = createLogger('dfe-ui.auth');

// The OIDC hand-back provider: an external IdP login lands on /login/oidc with an engine token.
export const authOptions: NextAuthOptions = {
  logger: {
    error: (code, metadata) => authLogger.error(code, { metadata }),
    warn: (code) => authLogger.warn(code),
    debug: (code, metadata) => authLogger.debug(code, { metadata }),
  },
  providers: [credentialsProvider, oidcTokenProvider(baseUrl)],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const expiresIn = (user as { expiresIn?: number }).expiresIn ?? 86400;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
        token.roles = (user as { roles?: string[] }).roles ?? [];
        token.passwordChangeRequired = user.passwordChangeRequired === true;
        delete token.error;
        return token;
      }

      // An update carries no trusted data: the engine renews what the session already holds.
      if (trigger === 'update') {
        return renewEngineSession(token, baseUrl);
      }

      if (
        typeof token.accessTokenExpiresAt === 'number' &&
        Date.now() >= token.accessTokenExpiresAt
      ) {
        return {
          ...token,
          error: 'AccessTokenExpired',
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { accessToken?: string }).accessToken =
          token.accessToken as string | undefined;
        (session.user as { roles?: string[] }).roles =
          (token.roles as string[]) ?? [];
      }
      if (token.error === 'AccessTokenExpired') {
        session.error = 'AccessTokenExpired';
      } else {
        delete session.error;
      }
      session.accessTokenExpiresAt = token.accessTokenExpiresAt;
      session.passwordChangeRequired = token.passwordChangeRequired === true;
      return session;
    },
    async redirect({ url, baseUrl: origin }) {
      return `${origin}${safeRedirectPath(url, origin)}`;
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
