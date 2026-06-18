import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import {
  OrganisationUpdateRequestBody,
  OrganisationUpdateResponse,
} from './types';

interface UseUpdateOrganisationProps {
  onSuccess?: (data: OrganisationUpdateResponse) => void;
  onError?: (error: Error) => void;
  org_name: string;
}

export const useUpdateOrganisation = ({
  org_name,
  onSuccess,
  onError,
}: UseUpdateOrganisationProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (organisation: OrganisationUpdateRequestBody) => {
      return apiClient.put(API_CONFIG.orgs.org, {
        body: organisation,
        pathParams: { name: org_name },
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
