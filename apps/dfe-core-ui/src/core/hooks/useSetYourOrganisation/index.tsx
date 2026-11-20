import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setYourOrganisation } from './api';
import { TYourOrganisationUpdateRequestBody } from './types';

/** Name the deployment's first organisation of its own. */
export const useSetYourOrganisation = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (body: TYourOrganisationUpdateRequestBody) =>
      setYourOrganisation({ body, headerParams: { 'If-None-Match': '*' } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.system.organisation(),
      });
      onSuccess?.();
    },
  });

  return { mutate, isPending, error };
};
