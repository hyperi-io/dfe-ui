'use client';

import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { RefreshTokenResponse } from './types';

interface UseRefreshTokenProps {
  onSuccess?: (data: RefreshTokenResponse) => void;
  onError?: (error: Error) => void;
}

export const useRefreshToken = ({
  onSuccess,
  onError,
}: UseRefreshTokenProps = {}) => {
  const { update } = useSession();

  const { data, mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: () => apiClient.post(API_CONFIG.auth.refresh),
    onSuccess: async (tokenResponse) => {
      await update({
        accessToken: tokenResponse.access_token,
        expiresIn: tokenResponse.expires_in,
        roles: tokenResponse.roles,
      });
      onSuccess?.(tokenResponse);
    },
    onError: (mutationError) => {
      onError?.(mutationError);
    },
  });

  return {
    data,
    mutate,
    mutateAsync,
    isPending,
    error,
  };
};
