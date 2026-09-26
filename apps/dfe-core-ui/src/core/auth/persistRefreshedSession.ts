'use client';

import type { TRefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';
import { getCsrfToken, getSession } from 'next-auth/react';

import { applyRefreshedAccessToken } from './applyRefreshedAccessToken';

/** Persists new tokens to the NextAuth JWT without `useSession().update()` (avoids loading flicker). */
export async function persistRefreshedSession(
  tokenResponse: TRefreshTokenResponse,
) {
  applyRefreshedAccessToken(tokenResponse);

  const csrfToken = await getCsrfToken();
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      csrfToken,
      data: {
        accessToken: tokenResponse.access_token,
        expiresIn: tokenResponse.expires_in,
        roles: tokenResponse.roles,
        passwordChangeRequired: tokenResponse.password_change_required,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to persist refreshed session (${res.status})`);
  }

  return getSession({ broadcast: true });
}
