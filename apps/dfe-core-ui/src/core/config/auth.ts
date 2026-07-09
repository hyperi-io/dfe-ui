import { API_CONFIG } from '@/core/config/api/endpoints';
import {
  PROXY_TRUST_PROVIDER_ID,
  extractEngineToken,
  isProxyAuthMode,
  verifyEngineToken,
} from '@/core/config/proxyTrust';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Default password flow: POST /auth/login then GET /me for roles. This is the
 * local-dev path when there is no proxy in front of the app.
 */
const credentialsProvider = CredentialsProvider({
  name: 'Credentials',
  credentials: {
    username: { label: 'Username', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.username || !credentials?.password) return null;
    const loginRes = await fetch(`${baseUrl}${API_CONFIG.auth.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });
    if (!loginRes.ok) return null;
    const tokenData = (await loginRes.json()) as {
      access_token: string;
      expires_in?: number;
    };

    const meRes = await fetch(`${baseUrl}${API_CONFIG.auth.me}`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const roles: string[] =
      meRes.ok &&
      meRes.headers.get('content-type')?.includes('application/json')
        ? (((await meRes.json()) as { roles?: string[] }).roles ?? [])
        : [];

    return {
      id: credentials.username,
      name: credentials.username,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in ?? 86400,
      roles,
    };
  },
});

/**
 * Proxy-trust flow (DFE_AUTH_MODE=proxy): no username/password. Reads the
 * engine ES384 token forwarded by Envoy (dfe_token cookie or Bearer header),
 * re-verifies it against the engine JWKS, and mints a session from its claims.
 * Same-origin engine calls still carry the token as Bearer via session.accessToken.
 */
const proxyTrustProvider = CredentialsProvider({
  id: PROXY_TRUST_PROVIDER_ID,
  name: 'Proxy Trust',
  credentials: {},
  async authorize(credentials, req) {
    const token = extractEngineToken(req, credentials ?? undefined);
    if (!token) return null;
    const user = await verifyEngineToken(token);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken: user.accessToken,
      expiresIn: user.expiresIn,
      roles: user.roles,
    };
  },
});

export const authOptions: NextAuthOptions = {
  providers: isProxyAuthMode()
    ? [proxyTrustProvider, credentialsProvider]
    : [credentialsProvider],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const expiresIn = (user as { expiresIn?: number }).expiresIn ?? 86400;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
        token.roles = (user as { roles?: string[] }).roles ?? [];
        delete token.error;
        return token;
      }

      if (trigger === 'update' && session) {
        const refresh = session as {
          accessToken?: string;
          expiresIn?: number;
          roles?: string[];
        };
        if (refresh.accessToken) {
          token.accessToken = refresh.accessToken;
          token.accessTokenExpiresAt =
            Date.now() + (refresh.expiresIn ?? 86400) * 1000;
          if (refresh.roles) {
            token.roles = refresh.roles;
          }
          delete token.error;
        }
        return token;
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
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
