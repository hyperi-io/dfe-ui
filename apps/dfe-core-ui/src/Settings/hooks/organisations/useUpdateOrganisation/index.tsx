import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrganisation } from './api';
import {
  TOrganisationUpdateRequestBody,
  TOrganisationUpdateResponse,
} from './types';

interface UseUpdateOrganisationProps {
  onSuccess?: (data: TOrganisationUpdateResponse) => void;
  /** The re-auth grant an update carries when it changes the IDs or whether the organisation is enabled. */
  reauth?: () => string | undefined;
  onError?: (error: Error) => void;
  org_name: string;
}

export const useUpdateOrganisation = ({
  org_name,
  onSuccess,
  onError,
  reauth,
}: UseUpdateOrganisationProps) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (organisation: TOrganisationUpdateRequestBody) =>
      updateOrganisation({
        body: organisation,
        pathParams: { name: org_name },
        headerParams: { [REAUTH_HEADER]: reauth?.() },
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

  return { data, mutate, isPending, error, reset };
};
