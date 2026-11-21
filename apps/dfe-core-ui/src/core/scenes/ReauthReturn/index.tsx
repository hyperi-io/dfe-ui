'use client';

import { REAUTH_MESSAGE } from '@/core/hooks/useReauth';
import type { TReauthMessage } from '@/core/hooks/useIdpReauth';
import { useEffect, useRef } from 'react';

/** The re-sign-in window's landing page: hands the engine's answer in the URL fragment to the console window that opened it, then closes. */
export const ReauthReturn = () => {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    const fields = new URLSearchParams(window.location.hash.slice(1));
    // The fragment holds a grant, so it leaves the address bar and history at once.
    window.history.replaceState(null, '', window.location.pathname);
    const message: TReauthMessage = {
      error: fields.get('error') ?? undefined,
      grant: fields.get('reauth_grant') ?? undefined,
      type: REAUTH_MESSAGE,
    };
    window.opener?.postMessage(message, window.location.origin);
    window.close();
  }, []);

  return <p className="p-6">You can close this window.</p>;
};
