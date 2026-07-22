import { useMutation } from '@tanstack/react-query';
import { updateRepositoryPreferencesApi } from './api';
import {
  TRepositoryPreferencesRequest,
  TRepositoryPreferencesResponse,
} from './types';

export const usePatchRepositoryPreferences = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TRepositoryPreferencesResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TRepositoryPreferencesRequest) =>
      updateRepositoryPreferencesApi({ body }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
