import { useMutation } from '@tanstack/react-query';
import { addGroupMember } from './api';
import { TAddGroupMemberRequestBody, TAddGroupMemberResponse } from './types';

interface UseAddGroupMemberProps {
  group_name: string;
  onSuccess?: (data: TAddGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useAddGroupMember = ({
  group_name,
  onSuccess,
  onError,
}: UseAddGroupMemberProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (member: TAddGroupMemberRequestBody) =>
      addGroupMember({
        body: member,
        pathParams: { name: group_name },
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
