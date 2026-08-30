import { useMutation } from '@tanstack/react-query';
import { dryRunAppFileApi } from './api';
import { TDryRunAppFileRequest, TDryRunAppFileResponse } from './types';

/**
 * Run an authored file over real events from the source and report each one.
 *
 * Nothing is written - no topic, no table, no commit - so passing unsaved
 * `content` is the point: it is the editor's own check before a save.
 */
export const useDryRunAppFile = ({
  service,
  instance,
  setName,
  onSuccess,
  onError,
}: {
  service: string;
  instance: string;
  setName: string;
  onSuccess?: (values: TDryRunAppFileResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TDryRunAppFileRequest) =>
      dryRunAppFileApi({
        body,
        pathParams: { service, instance, set_name: setName },
      }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
