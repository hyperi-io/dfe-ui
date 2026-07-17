import { useMutation } from '@tanstack/react-query';
import { updateRepositoryObjectApi } from './api';
import {
  TUpdateRepositoryObjectRequest,
  TUpdateRepositoryObjectResponse,
} from './types';

export const useUpdateRepositoryObject = ({
  scope,
  scope_id,
  namespace,
  key,
  onSuccess,
  onError,
}: {
  scope: string;
  scope_id: string;
  namespace: string;
  key: string;
  onSuccess?: (values: TUpdateRepositoryObjectResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TUpdateRepositoryObjectRequest) =>
      updateRepositoryObjectApi({
        body,
        pathParams: { scope, scope_id, namespace, key },
      }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
