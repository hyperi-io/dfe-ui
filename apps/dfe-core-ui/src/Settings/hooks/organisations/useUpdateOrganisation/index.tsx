import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrganisation } from './api';
import {
  TOrganisationUpdateRequestBody,
  TOrganisationUpdateResponse,
} from './types';

interface UseUpdateOrganisationProps {
  onSuccess?: (data: TOrganisationUpdateResponse) => void;
  onError?: (error: Error) => void;
  org_name: string;
}

export const useUpdateOrganisation = ({
  org_name,
  onSuccess,
  onError,
}: UseUpdateOrganisationProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (organisation: TOrganisationUpdateRequestBody) =>
      updateOrganisation({
        body: organisation,
        pathParams: { name: org_name },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgs.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgs.org(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
