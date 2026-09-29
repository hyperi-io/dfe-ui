'use client';

import { executeAccessTokenRefresh } from '@/core/auth/refreshAccessToken';
import { useMutation } from '@tanstack/react-query';
import type { Session } from 'next-auth';

interface UseRefreshTokenProps {
  onSuccess?: (session: Session) => void;
  onError?: (error: Error) => void;
}

export const useRefreshToken = ({
  onSuccess,
  onError,
}: UseRefreshTokenProps = {}) => {
  const { data, mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: () => executeAccessTokenRefresh(),
    onSuccess: (session) => {
      onSuccess?.(session);
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
