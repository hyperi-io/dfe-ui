import { INFINITE_SCHEMAS_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDerivedSchema } from './api';
import {
  TCreateDerivedSchemaRequest,
  TCreateDerivedSchemaResponse,
} from './types';

interface UseCreateDerivedSchemaProps {
  onSuccess?: (data: TCreateDerivedSchemaResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * useCreateDerivedSchema - create a derived schema.
 *
 * A derived schema is a selection of columns from one meta schema, so the body
 * carries `base`, `base_version` and a `select` list rather than columns.
 *
 * @example
 * const { mutate } = useCreateDerivedSchema({ onSuccess: () => {} });
 *
 * mutate({
 *   path: 'derived/beats/filebeat_auth',
 *   base: 'meta/beats/filebeat',
 *   base_version: '1.0.0',
 *   current: '1.0.0',
 *   versions: {
 *     '1.0.0': {
 *       date: '2026-09-21',
 *       summary: 'system.auth subset',
 *       select: [{ name: 'timestamp' }, { name: 'user_name', index: 'exact_match' }],
 *     },
 *   },
 * });
 */
export const useCreateDerivedSchema = ({
  onSuccess,
  onError,
}: UseCreateDerivedSchemaProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (schema: TCreateDerivedSchemaRequest) =>
      createDerivedSchema({
        body: schema,
        pathParams: { schema_path: schema.path },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SCHEMAS_QUERY_KEY(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
