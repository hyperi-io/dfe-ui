import { useMutation } from '@tanstack/react-query';
import { rotatePassword } from './api';
import { TRotatePasswordRequestBody, TRotatePasswordResponse } from './types';

interface UseRotatePasswordProps {
  onSuccess?: (data: TRotatePasswordResponse) => void;
  onError?: (error: Error) => void;
  username: string;
}

export const useRotatePassword = ({
  username,
  onSuccess,
  onError,
}: UseRotatePasswordProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TRotatePasswordRequestBody) =>
      rotatePassword({
        body,
        pathParams: { username },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
