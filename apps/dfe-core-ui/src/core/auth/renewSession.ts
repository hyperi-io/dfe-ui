'use client';

import type { Session } from 'next-auth';
import { getCsrfToken, getSession } from 'next-auth/react';

const isRenewed = (session: Session | null): session is Session =>
  typeof session?.user?.accessToken === 'string' &&
  session.user.accessToken !== '' &&
  session.error === undefined;

/**
 * Asks the server to renew the engine token behind this session, without
 * `useSession().update()` (avoids loading flicker). The request carries no token
 * data; the server refreshes against the engine and returns the new session.
 */
export async function renewSession(): Promise<Session> {
  const csrfToken = await getCsrfToken();
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csrfToken }),
  });
  if (!res.ok) {
    throw new Error(`Failed to renew the session (${res.status})`);
  }

  // Broadcast so every open tab picks up the renewed token.
  const session = await getSession({ broadcast: true });
  if (!isRenewed(session)) {
    throw new Error('The engine did not renew the session');
  }
  return session;
}
