import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';

export const useDeleteOrganisation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (org_name: string) => {
      return apiClient.delete(API_CONFIG.orgs.org, {
        pathParams: { name: org_name },
      });
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
