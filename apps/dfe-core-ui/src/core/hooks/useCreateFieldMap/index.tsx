import { useMutation } from '@tanstack/react-query';
import { createFieldMap } from './api';
import { TCreateFieldMapRequest, TCreateFieldMapResponse } from './types';

interface UseCreateFieldMapProps {
  onSuccess?: (data: TCreateFieldMapResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateFieldMap = ({
  onSuccess,
  onError,
}: UseCreateFieldMapProps = {}) => {
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TCreateFieldMapRequest) => createFieldMap(body),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error, reset };
};
