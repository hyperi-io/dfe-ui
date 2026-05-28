import { useCreateSchema } from '@/core/hooks/useCreateSchema';
import {
  SchemaCreateRequest,
  SchemaCreateResponse,
} from '@/core/hooks/useCreateSchema/types';
import { CreateSchemaFormData } from '@/core/schemas/CreateSchemaForm/CreateSchemaForm.schema';
import { useFetchInfiniteFilteredSchemaDetailColumns } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns';
import { MetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { useState } from 'react';

interface UseCloneSchemaProps {
  onSuccess?: (schema: SchemaCreateResponse) => void;
  onError?: (error: Error) => void;
  schema_path: string;
  version: string | null;
}

const cloneSchemaError = ({
  version,
  isFetchingSchemaDetail,
  schemaDetailData,
}: {
  version: string | null;
  isFetchingSchemaDetail: boolean;
  schemaDetailData: MetaSchemaDetailResponse | null;
}) => {
  if (isFetchingSchemaDetail) return;
  if (!version) return;
  if (schemaDetailData?.version?.columns?.items) return;
  return { message: 'Unable to clone schema' };
};
export const useCloneSchema = ({
  onSuccess,
  onError,
  schema_path,
  version,
}: UseCloneSchemaProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: schemaDetailData, isLoading: isFetchingSchemaDetail } =
    useFetchInfiniteFilteredSchemaDetailColumns({
      schema_path: schema_path,
      version,
      per_page: -1,
    });

  const {
    mutate,
    isPending,
    error: createSourceError,
  } = useCreateSchema({
    onSuccess,
    onError,
  });

  const handleMutate = (
    values: Pick<
      CreateSchemaFormData,
      'path' | 'name' | 'version' | 'description'
    >,
  ) => {
    if (!schemaDetailData?.version?.columns?.items) {
      const errMessage = 'Unable to clone schema - no available columns';
      setErrorMessage(errMessage);
      onError?.(new Error(errMessage));
      return;
    }
    const body: SchemaCreateRequest = {
      path: values.path ? `${values.path}/${values.name}` : values.name,
      current: values.version,
      versions: {
        [values.version]: {
          date: new Date().toISOString(),
          type: 'model',
          summary: values.description ?? '',
          columns: schemaDetailData.version.columns.items,
        },
      },
    };
    mutate(body);
  };

  const error =
    createSourceError ??
    (errorMessage ? new Error(errorMessage) : null) ??
    cloneSchemaError({ version, isFetchingSchemaDetail, schemaDetailData });

  return { mutate: handleMutate, isPending, error };
};
