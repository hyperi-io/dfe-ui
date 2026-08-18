'use client';

import { getAccessTokenRefreshInFlight } from '@/core/auth/accessTokenRefreshFlight';
import { executeAccessTokenRefresh } from '@/core/auth/refreshAccessToken';
import { isNoAuthRoute } from '@/core/config/isNoAuthRoute';
import { signOut } from 'next-auth/react';

let signingOut = false;

export async function handleApiUnauthorized() {
  if (signingOut || typeof window === 'undefined') {
    return;
  }

  const refreshInFlight = getAccessTokenRefreshInFlight();
  if (refreshInFlight) {
    try {
      await refreshInFlight;
      return;
    } catch {
      return;
    }
  }

  try {
    await executeAccessTokenRefresh();
    return;
  } catch {
    // Fall through to sign-out when refresh cannot recover the session.
  }

  const { pathname, search } = window.location;
  if (isNoAuthRoute(pathname)) {
    return;
  }

  signingOut = true;
  const callbackUrl = `${pathname}${search}`;

  try {
    await signOut({
      callbackUrl: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    });
  } finally {
    signingOut = false;
  }
}
