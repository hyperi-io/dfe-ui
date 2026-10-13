import { useMutation } from '@tanstack/react-query';
import { updateGroup } from './api';
import { TGroupUpdateRequestBody, TGroupUpdateResponse } from './types';

interface UseUpdateGroupProps {
  onSuccess?: (data: TGroupUpdateResponse) => void;
  onError?: (error: Error) => void;
  group_name: string;
}

export const useUpdateGroup = ({
  group_name,
  onSuccess,
  onError,
}: UseUpdateGroupProps) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (group: TGroupUpdateRequestBody) =>
      updateGroup({
        body: group,
        pathParams: { name: group_name },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
