import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { SchemaCreateRequest, SchemaCreateResponse } from './types';

interface UseCreateSchemaProps {
  onSuccess?: (data: SchemaCreateResponse) => void;
  onError?: (error: Error) => void;
}

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
