import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOrganisation } from './api';

export const useDeleteOrganisation = ({
  onSuccess,
  reauth,
  onError,
}: {
  onSuccess?: () => void;
  /** The re-auth grant the delete carries. */
  reauth?: () => string | undefined;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (org_name: string) =>
      deleteOrganisation({
        pathParams: { name: org_name },
        headerParams: { [REAUTH_HEADER]: reauth?.() },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgs.default(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgs.org(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error, reset };
};
