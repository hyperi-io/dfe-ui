import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { INFINITE_SCHEMAS_QUERY_KEY } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import { INFINITE_SCHEMA_DETAIL_COLUMNS_QUERY_KEY } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SchemaCreateVersionRequest,
  SchemaCreateVersionResponse,
} from './types';

interface UseCreateSchemaVersionProps {
  onSuccess?: (data: SchemaCreateVersionResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * useCreateSchemaVersion - Create a new schema version
 * This hook is intended to be used to create a new schema version for an existing schema.
 *
 * The mutate function accepts SchemaCreateVersionRequest which has the params type (used for versioning)
 * and columns (used for the schema columns)
 *
 * The parameters object is used to specify the schema path and is required to identify the schema to create the version for.
 *
 * @param onSuccess - Callback function to be called when the mutation is successful
 * @param onError - Callback function to be called when the mutation fails
 * @returns {
 *   data: SchemaCreateVersionResponse;
 *   mutate: (variables: { schema: SchemaCreateVersionRequest; parameters: { schema_path: string | null } }) => void;
 *   isPending: boolean;
 *   error: Error | null;
 * }
 *
 * @example
 * const { mutate, isPending, error, data } = useCreateSchemaVersion({
 *   onSuccess: (data) => {
 *     console.log('Mutation successful', data);
 *   },
 *   onError: (error) => {
 *     console.error('Mutation failed', error);
 *   },
 * });
 *
 * mutate({
 *   schema: {
 *     type: 'model',
 *     columns: [
 *       { name: 'string', type: 'string' },
 *     ],
 *   },
 *   parameters: { schema_path: 'sub_folder/path' },
 * });
 */
export const useCreateSchemaVersion = ({
  onSuccess,
  onError,
}: UseCreateSchemaVersionProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      schema,
      parameters,
    }: {
      schema: SchemaCreateVersionRequest;
      parameters: { schema_path: string | null };
    }) => {
      if (!parameters.schema_path) {
        throw new Error('Schema path is required');
      }
      return apiClient.post(API_CONFIG.schemas.schemaVersions, {
        body: schema,
        pathParams: { schema_path: parameters.schema_path },
      });
    },

    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: INFINITE_SCHEMA_DETAIL_COLUMNS_QUERY_KEY({
          schema_path: data.path,
          version: data.current,
        }),
      });
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
