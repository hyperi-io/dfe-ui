import { ReauthModal } from '@/core/components/ReauthModal';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import type { TReauthKind } from '@/core/hooks/useReauth';
import { useRef, useState } from 'react';

/**
 * Ask for the signed-in user's password before a change to *target*, then run the change.
 * The grant the engine signs is kept until dropped, so the caller decides how long one confirmation lasts.
 */
export const useReauthGrant = (
  target: string,
  kind: TReauthKind = 'account',
  verb = 'change',
) => {
  const grantRef = useRef<string>(undefined);
  const [pending, setPending] = useState<{ run: (grant: string) => void }>();

  const modal = (
    <ReauthModal
      kind={kind}
      open={pending !== undefined}
      target={target}
      verb={verb}
      onCancel={() => setPending(undefined)}
      onGranted={(granted) => {
        grantRef.current = granted;
        setPending(undefined);
        pending?.run(granted);
      }}
    />
  );

  return {
    /** Ask for the password, then run *run* with the grant. */
    ask: (run: (grant: string) => void) => setPending({ run }),
    /** When *refusal* is the engine asking for the password, ask for it and then run *retry*. Returns whether it asked, so a change can be tried first and refused for any other reason without a prompt. */
    askIfRequired: (refusal: unknown, retry: () => void) => {
      if (getApiErrorResponseBody(refusal)?.code !== 'reauth_required') {
        return false;
      }
      setPending({ run: retry });
      return true;
    },
    /** Forget the grant, so the next edit asks again. */
    drop: () => {
      grantRef.current = undefined;
    },
    /** The grant held now, read when a request goes out. */
    grant: () => grantRef.current,
    /** Hold a grant taken by a confirmation panel of the caller's own. */
    keep: (granted: string) => {
      grantRef.current = granted;
    },
    modal,
  };
};
