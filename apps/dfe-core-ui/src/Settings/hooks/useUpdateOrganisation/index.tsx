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
}

export const useUpdateOrganisation = ({
  onSuccess,
  onError,
}: UseUpdateOrganisationProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (organisation: OrganisationUpdateRequestBody) => {
      return apiClient.put(API_CONFIG.orgs.org, {
        body: organisation,
        pathParams: { name: organisation.org_name },
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
