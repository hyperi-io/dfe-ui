import { type TReauthVerb, ReauthModal } from '@/core/components/ReauthModal';
import type { TReauthKind } from '@/core/hooks/useReauth';
import { useRef, useState } from 'react';

/**
 * Ask for the signed-in user's password before the account or group *target* is *verb*ed, then run the change.
 * The grant the engine signs is kept until dropped, so the caller decides how long one confirmation lasts.
 */
export const useReauthGrant = (
  target: string,
  kind: TReauthKind = 'account',
  verb: TReauthVerb = 'change',
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
    /** Forget the grant, so the next edit asks again. */
    drop: () => {
      grantRef.current = undefined;
    },
    /** The grant held now, read when a request goes out. */
    grant: () => grantRef.current,
    modal,
  };
};
