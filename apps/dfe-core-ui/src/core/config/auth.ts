import { API_CONFIG } from '@/core/config/api/endpoints';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
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
    }),
  ],
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
