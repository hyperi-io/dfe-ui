import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrganisation } from './api';
import {
  TOrganisationCreateRequestBody,
  TOrganisationCreateResponse,
} from './types';

interface UseCreateOrganisationProps {
  onSuccess?: (data: TOrganisationCreateResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateOrganisation = ({
  onSuccess,
  onError,
}: UseCreateOrganisationProps = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (organisation: TOrganisationCreateRequestBody) =>
      createOrganisation({
        body: organisation,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgs.default(),
      });
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
