'use client';

import { executeAccessTokenRefresh } from '@/core/auth/refreshAccessToken';
import { useMutation } from '@tanstack/react-query';
import { TRefreshTokenResponse } from './types';

interface UseRefreshTokenProps {
  onSuccess?: (data: TRefreshTokenResponse) => void;
  onError?: (error: Error) => void;
}

export const useRefreshToken = ({
  onSuccess,
  onError,
}: UseRefreshTokenProps = {}) => {
  const { data, mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: () => executeAccessTokenRefresh(),
    onSuccess: (tokenResponse) => {
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
