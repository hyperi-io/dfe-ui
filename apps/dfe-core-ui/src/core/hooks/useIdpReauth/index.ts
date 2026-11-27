import {
  REAUTH_MESSAGE,
  REAUTH_RETURN_PATH,
  type TReauthKind,
} from '@/core/hooks/useReauth';
import { oidcReauth } from '@/core/hooks/useReauth/api';
import { useEffect, useRef, useState } from 'react';

const REAUTH_WINDOW = 'dfe-reauth';
const REAUTH_WINDOW_FEATURES = 'popup,width=520,height=680';

// How often a sign-in window the user closed is noticed.
const CLOSED_POLL_MS = 500;

const REFUSALS: Record<string, string> = {
  reauth_expired: 'The sign-in took too long. Try again.',
  reauth_not_fresh:
    "Your identity provider didn't ask for your credentials again, so it couldn't confirm it's you.",
  reauth_other_person: 'That sign-in was a different account.',
};

const FAILED = "The sign-in didn't complete. Try again.";

/** What the re-sign-in window's landing page posts back to the console window that opened it. */
export type TReauthMessage = {
  error?: string;
  grant?: string;
  type: typeof REAUTH_MESSAGE;
};

const isReauthMessage = (data: unknown): data is TReauthMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as { type?: unknown }).type === REAUTH_MESSAGE;

/** Confirm the signed-in user by a fresh sign-in at its identity provider, in its own window, handing back the grant the engine signs for the target. */
export const useIdpReauth = ({
  onGranted,
}: {
  onGranted: (grant: string) => void;
}) => {
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const stopRef = useRef<() => void>(undefined);
  const grantedRef = useRef(onGranted);

  useEffect(() => {
    grantedRef.current = onGranted;
  }, [onGranted]);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = undefined;
    setIsPending(false);
  };

  useEffect(() => () => stopRef.current?.(), []);

  const start = async ({
    kind,
    target,
  }: {
    kind: TReauthKind;
    target: string;
  }) => {
    stop();
    setError(undefined);
    // Opened inside the click so no pop-up blocker stops it. The IdP's address follows once the engine answers.
    const popup = window.open('', REAUTH_WINDOW, REAUTH_WINDOW_FEATURES);
    if (!popup) {
      setError('Allow pop-ups for this site, then try again.');
      return;
    }
    setIsPending(true);
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== popup) return;
      if (!isReauthMessage(event.data)) return;
      stop();
      if (event.data.grant) {
        grantedRef.current(event.data.grant);
        return;
      }
      setError(REFUSALS[event.data.error ?? ''] ?? FAILED);
    };
    // A closed window waits one more tick, so an answer it posted as it closed still lands.
    const poll = window.setInterval(() => {
      if (popup.closed) window.setTimeout(stop, CLOSED_POLL_MS);
    }, CLOSED_POLL_MS);
    window.addEventListener('message', onMessage);
    stopRef.current = () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(poll);
    };
    try {
      const { authorization_url } = await oidcReauth({
        body: {
          kind,
          return_to: `${window.location.origin}${REAUTH_RETURN_PATH}`,
          target,
        },
      });
      if (!authorization_url) throw new Error(FAILED);
      popup.location.href = authorization_url;
    } catch (caught) {
      popup.close();
      stop();
      setError(caught instanceof Error ? caught.message : FAILED);
    }
  };

  return {
    error,
    isPending,
    reset: () => {
      stop();
      setError(undefined);
    },
    start,
  };
};
