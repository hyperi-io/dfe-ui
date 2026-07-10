import { useMutation } from '@tanstack/react-query';
import { updateAlert } from './api';
import { TAlertUpdateRequest, TAlertUpdateResponse } from './types';

export const useUpdateAlert = ({
  name,
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TAlertUpdateResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (alert: TAlertUpdateRequest) =>
      updateAlert({
        body: alert,
        pathParams: { name },
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
