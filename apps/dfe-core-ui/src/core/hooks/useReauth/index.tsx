import type { components } from '@repo/dfe-engine-types';
import { useMutation } from '@tanstack/react-query';
import { reauth } from './api';

/** The kind of target a grant names. */
export type TReauthKind = components['schemas']['ReauthKind'];

/** The header a change carries its re-auth grant in. */
export const REAUTH_HEADER = 'X-DFE-Reauth';

/** The console page an identity-provider re-sign-in window lands on. */
export const REAUTH_RETURN_PATH = '/login/reauth';

/** The message type that page posts its answer to the opening window under. */
export const REAUTH_MESSAGE = 'dfe-reauth';

/** Trade the signed-in user's password for a grant to change *target*. */
export const useReauth = ({
  onSuccess,
}: {
  onSuccess: (grant: string) => void;
}) => {
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: ({
      kind,
      password,
      target,
    }: {
      kind: TReauthKind;
      password: string;
      target: string;
    }) => reauth({ body: { kind, password, target } }),
    onSuccess: (data) => onSuccess(data.grant),
  });

  return { mutate, isPending, error, reset };
};
