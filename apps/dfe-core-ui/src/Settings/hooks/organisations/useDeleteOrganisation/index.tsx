import { useMutation } from '@tanstack/react-query';
import { deleteOrganisation } from './api';

export const useDeleteOrganisation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (org_name: string) =>
      deleteOrganisation({
        pathParams: { name: org_name },
      }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { mutate, isPending, error };
};
