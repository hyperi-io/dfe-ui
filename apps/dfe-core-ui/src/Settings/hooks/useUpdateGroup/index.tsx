import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { GroupUpdateRequestBody, GroupUpdateResponse } from './types';

interface UseUpdateGroupProps {
  onSuccess?: (data: GroupUpdateResponse) => void;
  onError?: (error: Error) => void;
  group_name: string;
}

export const useUpdateGroup = ({
  group_name,
  onSuccess,
  onError,
}: UseUpdateGroupProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (group: GroupUpdateRequestBody) => {
      return apiClient.put(API_CONFIG.groups.group, {
        body: group,
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

  return { data, mutate, isPending, error };
};
