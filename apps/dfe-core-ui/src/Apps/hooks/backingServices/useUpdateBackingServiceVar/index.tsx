import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBackingServiceVarApi } from './api';
import {
  TUpdateBackingServiceVarRequest,
  TUpdateBackingServiceVarResponse,
} from './types';

import { BACKING_SERVICES_QUERY_KEY } from '@/Apps/hooks/backingServices/useFetchBackingServices';

/**
 * Set one value in a backing service's overlay, through the governed path.
 *
 * `overlayName` is the service's CHART, not its `overlay` filename - the
 * filename is what Argo reads, the chart is what addresses the resource. `path`
 * is the full dot-path the overlay stores, prefix included.
 */
export const useUpdateBackingServiceVar = ({
  overlayName,
  onSuccess,
  onError,
}: {
  overlayName: string;
  onSuccess?: (values: TUpdateBackingServiceVarResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: ({
      path,
      body,
    }: {
      path: string;
      body: TUpdateBackingServiceVarRequest;
    }) =>
      updateBackingServiceVarApi({
        body,
        pathParams: { name: overlayName, path },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: BACKING_SERVICES_QUERY_KEY });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
