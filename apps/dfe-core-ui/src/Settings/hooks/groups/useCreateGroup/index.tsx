import { useMutation } from '@tanstack/react-query';
import { createGroup } from './api';
import { TGroupCreateRequestBody, TGroupCreateResponse } from './types';

interface UseCreateGroupProps {
  onSuccess?: (data: TGroupCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateGroup = ({
  onSuccess,
  onError,
}: UseCreateGroupProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (group: TGroupCreateRequestBody) =>
      createGroup({
        body: group,
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
