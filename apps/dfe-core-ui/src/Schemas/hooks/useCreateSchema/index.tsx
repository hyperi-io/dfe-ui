import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { SchemaCreateRequest, SchemaCreateResponse } from './types';

interface UseCreateSchemaProps {
  onSuccess?: (data: SchemaCreateResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * useCreateSchema - Create a new schema
 * This hook is intended to be used to create a new schema.
 *
 * The mutate function accepts SchemaCreateRequest which has current (current version),
 * versions object (defaults to major as a new model is being added) and path (schema path - sub_folder/file_name)
 *
 * The path is required to specify the schema path and is used to identify the schema to create.
 *
 * @param onSuccess - Callback function to be called when the mutation is successful
 * @param onError - Callback function to be called when the mutation fails
 * @returns {
 *   data: SchemaCreateResponse;
 *   mutate: (schema: SchemaCreateRequest) => void;
 *   isPending: boolean;
 *   error: Error | null;
 * }
 *
 * @example
 * const { mutate, isPending, error, data } = useCreateSchema({
 *   onSuccess: (data) => {
 *     console.log('Mutation successful', data);
 *   },
 *   onError: (error) => {
 *     console.error('Mutation failed', error);
 *   },
 * });
 *
 * mutate({
 *   current: '1.0.0',
 *   versions: {
 *     '1.0.0': {
 *       type: 'model',
 *       columns: [
 *         { name: 'string', type: 'string' },
 *       ],
 *     },
 *   },
 *   path: 'sub_folder/file_name',
 * });
 */
export const useCreateSchema = ({
  onSuccess,
  onError,
}: UseCreateSchemaProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (schema: SchemaCreateRequest) =>
      apiClient.post(API_CONFIG.schemas.schema, {
        body: schema,
        pathParams: { schema_path: schema.path ?? '' },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error };
};
