import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { RemoveGroupMemberResponse } from './types';

interface UseRemoveGroupMemberProps {
  group_name: string;
  onSuccess?: (data: RemoveGroupMemberResponse) => void;
  onError?: (error: Error) => void;
}

export const useRemoveGroupMember = ({
  group_name,
  onSuccess,
  onError,
}: UseRemoveGroupMemberProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (username: string) => {
      return apiClient.delete(API_CONFIG.groups.groupMember, {
        pathParams: { name: group_name, username },
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
