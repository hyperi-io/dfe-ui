import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SCHEMA_DETAIL_COLUMNS_QUERY_KEY } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MetaSchemaUpdateParameters,
  MetaSchemaUpdateRequestBody,
  MetaSchemaUpdateResponse,
} from './types';

interface UseUpdateSchemaProps {
  onSuccess?: (data: MetaSchemaUpdateResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * useUpdateSchema - Update a schema or update current version
 *
 * @param onSuccess - Callback function to be called when the mutation is successful
 * @param onError - Callback function to be called when the mutation fails
 * @returns {
 *   mutate: (schema: MetaSchemaUpdateRequestBody, parameters: MetaSchemaUpdateParameters) => void;
 *   isPending: boolean;
 *   error: Error | null;
 *   reset: () => void;
 * }
 *
 * @example
 * const { mutate, isPending, error, reset } = useUpdateSchema({
 *   onSuccess: (data) => {
 *     console.log('Mutation successful', data);
 *   },
 *   onError: (error) => {
 *     console.error('Mutation failed', error);
 *   },
 * });
 * // Updates only summary
 * mutate({
 *   schema: {
 *     summary: 'string',
 *   },
 *   parameters: {
 *     schema_path: 'string',
 *     version: 'string',
 *   },
 * });
 *
 * // Updates only current version
 * mutate({
 *   schema: {
 *     current: '1.0.0',
 *   },
 *   parameters: {
 *     schema_path: 'string',
 *     version: 'string',
 *   },
 * });
 */

export const useUpdateSchema = ({
  onSuccess,
  onError,
}: UseUpdateSchemaProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: ({
      schema,
      parameters,
    }: {
      schema: MetaSchemaUpdateRequestBody;
      parameters: MetaSchemaUpdateParameters;
    }) => {
      return apiClient.patch(API_CONFIG.schemas.schema, {
        body: schema,
        pathParams: { schema_path: parameters.schema_path },
        queryParams: { version: parameters.version },
      });
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SCHEMA_DETAIL_COLUMNS_QUERY_KEY({
          schema_path: data.path,
          version: data.current,
        }),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
