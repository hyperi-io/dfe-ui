import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { GroupCreateRequestBody, GroupCreateResponse } from './types';

interface UseCreateGroupProps {
  onSuccess?: (data: GroupCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateGroup = ({
  onSuccess,
  onError,
}: UseCreateGroupProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (group: GroupCreateRequestBody) => {
      return apiClient.post(API_CONFIG.groups.default, {
        body: group,
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
