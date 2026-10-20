import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkAppFileApi } from './api';
import { TLinkAppFileRequest, TLinkAppFileResponse } from './types';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';

/**
 * Link a file in the set to a library artefact.
 *
 * The artefact's content is resolved into the file set, because a chart can
 * only render what is already in the values. The provenance is committed
 * beside it, so what deployed is never ambiguous.
 */
export const useLinkAppFile = ({
  service,
  instance,
  setName,
  etag,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  setName: string;
  etag?: string | null;
  onSuccess?: (values: TLinkAppFileResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TLinkAppFileRequest) =>
      linkAppFileApi({
        body,
        pathParams: { service, instance, set_name: setName },
        headerParams: { 'If-Match': etag },
      }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.apps.files({ service, instance, setName }),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.apps.file({
          service,
          instance,
          setName,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.apps.fileLinks({ service, instance, setName }),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
