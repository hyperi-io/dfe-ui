import { useMutation } from '@tanstack/react-query';
import { removeGroupMember } from './api';
import { TRemoveGroupMemberResponse } from './types';

interface UseRemoveGroupMemberProps {
  group_name: string;
  onSuccess?: (data: TRemoveGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useRemoveGroupMember = ({
  group_name,
  onSuccess,
  onError,
}: UseRemoveGroupMemberProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (username: string) =>
      removeGroupMember({
        pathParams: { name: group_name, username },
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
