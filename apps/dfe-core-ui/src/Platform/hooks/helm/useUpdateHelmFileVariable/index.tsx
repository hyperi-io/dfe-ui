import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateHelmFileVariableApi } from './api';
import {
  THelmFileVariableRequest,
  TUpdateHelmFileVariableResponse,
} from './types';

export const useUpdateHelmFileVariable = ({
  name,
  path,
  onSuccess,
  onError,
}: {
  name: string;
  path: string;
  onSuccess?: (values: TUpdateHelmFileVariableResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: THelmFileVariableRequest) =>
      updateHelmFileVariableApi({ body, pathParams: { name, path } }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.helm.fileVariables(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.helm.listFiles(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
