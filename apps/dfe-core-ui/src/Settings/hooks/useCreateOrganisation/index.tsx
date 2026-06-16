import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import {
  OrganisationCreateRequestBody,
  OrganisationCreateResponse,
} from './types';

interface UseCreateOrganisationProps {
  onSuccess?: (data: OrganisationCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateOrganisation = ({
  onSuccess,
  onError,
}: UseCreateOrganisationProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (organisation: OrganisationCreateRequestBody) => {
      return apiClient.post(API_CONFIG.orgs.default, {
        body: organisation,
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
