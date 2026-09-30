import {
  clientNavigationPathFromAuthUrl,
  safeRedirectPath,
} from '@/core/config/loginCallback';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TLoginRequest } from './types';

export const useLogin = ({
  callbackUrl: callbackUrl_,
  onSuccess,
  redirectOnSuccess = true,
}: {
  callbackUrl?: string;
  onSuccess?: () => void;
  /** When false, only refreshes the session (no client navigation). */
  redirectOnSuccess?: boolean;
} = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = callbackUrl_ ?? searchParams.get('callbackUrl') ?? '/';

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async (data: TLoginRequest) => {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        callbackUrl,
        redirect: false,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result) => {
      onSuccess?.();
      router.refresh();

      if (!redirectOnSuccess) {
        return;
      }

      // NextAuth builds its URL on NEXTAUTH_URL, which can differ from the browser's origin.
      const target = result?.url
        ? clientNavigationPathFromAuthUrl(result.url)
        : callbackUrl;
      router.push(safeRedirectPath(target, window.location.origin));
    },
  });

  return { mutate, isPending, error, reset };
};
