'use client';

import { signOut } from 'next-auth/react';

let signingOut = false;

export async function handleApiUnauthorized() {
  if (signingOut || typeof window === 'undefined') {
    return;
  }

  const { pathname, search } = window.location;
  if (pathname.startsWith('/login')) {
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
