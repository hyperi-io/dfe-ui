import { components } from '@repo/dfe-engine-types';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export const useLogin = ({
  callbackUrl: callbackUrl_,
}: {
  callbackUrl?: string;
} = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = callbackUrl_ ?? searchParams.get('callbackUrl') ?? '/';

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: components['schemas']['LoginRequest']) => {
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
      const url = result?.url ?? callbackUrl;
      // Extract pathname for client-side navigation (router.push with full URLs can cause full reload)
      const path =
        typeof url === 'string' && url.startsWith('http')
          ? new URL(url).pathname
          : url;
      router.refresh();
      router.push(path);
    },
  });

  return { mutate, isPending, error };
};
