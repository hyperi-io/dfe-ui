import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { AddGroupMemberRequestBody, AddGroupMemberResponse } from './types';

interface UseAddGroupMemberProps {
  group_name: string;
  onSuccess?: (data: AddGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useAddGroupMember = ({
  group_name,
  onSuccess,
  onError,
}: UseAddGroupMemberProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (member: AddGroupMemberRequestBody) => {
      return apiClient.post(API_CONFIG.groups.groupMembers, {
        body: member,
        pathParams: { name: group_name },
      });
    },
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
