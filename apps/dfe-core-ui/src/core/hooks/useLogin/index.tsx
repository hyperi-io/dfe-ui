import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { components } from '@hyperi/dfe-engine-types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
  const router = useRouter();
  const { mutate, data, isPending, error } = useMutation({
    mutationFn: (data: components['schemas']['LoginRequest']) => {
      return apiClient.post(API_CONFIG.auth.login, {
        body: data,
      });
    },
    onSuccess: (data) => {
      const maxAge = data.expires_in ?? 86400; // default 24h
      document.cookie = `token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Strict`;
      router.push('/');
    },
  });

  return { mutate, isPending, error, data };
};
