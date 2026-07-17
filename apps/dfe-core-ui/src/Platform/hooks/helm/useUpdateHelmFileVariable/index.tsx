import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: THelmFileVariableRequest) =>
      updateHelmFileVariableApi({ body, pathParams: { name, path } }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
