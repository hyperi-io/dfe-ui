import { useMutation } from '@tanstack/react-query';
import { testTransform } from './api';
import { TTestTransformRequest, TTestTransformResponse } from './types';

export const useTestTransform = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TTestTransformResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: async (transform: TTestTransformRequest) =>
      testTransform(transform),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
