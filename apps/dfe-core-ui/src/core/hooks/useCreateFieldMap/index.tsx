import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TCreateFieldMapRequest) => createFieldMap(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.fieldMaps.default(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { mutate, isPending, error, reset };
};
