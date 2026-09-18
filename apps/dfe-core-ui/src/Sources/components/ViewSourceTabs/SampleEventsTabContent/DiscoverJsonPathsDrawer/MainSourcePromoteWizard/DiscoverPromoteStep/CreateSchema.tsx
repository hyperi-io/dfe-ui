import { CreateSchemaForm } from '@/core/components/CreateSchemaForm';
import { useCreateSchema } from '@/core/hooks/useCreateSchema';
import { transformFormDataToRequestBody } from '@/core/hooks/useCreateSchema/useCreateSchema.helpers';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { v4 as uuidv4 } from 'uuid';

import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { ReviewCreateSchemaForm } from '@/core/components/ReviewCreateSchemaForm';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import {
  CreateSchemaReviewProvider,
  useCreateSchemaReviewContext,
} from '@/core/contexts/CreateSchemaReviewContext';
import { ListSchemasProvider } from '@/core/contexts/ListSchemasContext';
import { TCreateSchemaResponse } from '@/core/hooks/useCreateSchema/types';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { App } from 'antd';
import { useMemo } from 'react';

interface CreateSchemaProps {
  jsonPaths: {
    data: TJsonPathsResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  onSuccess?: (schema: TCreateSchemaResponse) => void;
  className?: string;
}
export const CreateSchemaBase = ({
  jsonPaths,
  onSuccess,
  className,
}: CreateSchemaProps) => {
  const { notification } = App.useApp();
  const {
    isReviewing,
    buttonLabel,
    reviewValues,
    handleReview,
    setFormErrorMessage,
  } = useCreateSchemaReviewContext();

  const columns = useMemo(() => {
    return (
      jsonPaths.data?.paths.map((path) => ({
        id: uuidv4(),
        ...path.column,
        use_case: path.column.use_case ?? undefined,
        comment: path.column.comment ?? undefined,
        attribute: path.column.attribute ?? undefined,
        expr: path.column.expr ?? undefined,
        _field_type: path.column._field_type ?? SCHEMA_FIELD_TYPES.PROMOTED,
      })) ?? []
    );
  }, [jsonPaths.data]);
  const { mutate: createSchema, isPending: isCreatingSchema } = useCreateSchema(
    {
      onSuccess: (response) => {
        notification.success({
          title: `${response.path} created successfully`,
          placement: 'bottomLeft',
        });
        onSuccess?.(response);
      },
      onError: (error) => {
        const body = getApiErrorResponseBody(error);
        setFormErrorMessage({
          message: body?.message ?? 'An unexpected error occurred',
          errors: body?.errors ?? [],
        });
      },
    },
  );

  const handleSubmit = (values: CreateSchemaFormData) => {
    const { requestBody } = transformFormDataToRequestBody(values);
    createSchema(requestBody);
  };

  return (
    <div className={className}>
      <div className={isReviewing ? 'hidden' : undefined}>
        <CreateSchemaForm
          key={`${columns.length}`}
          buttonLabel="Review Schema Version"
          onFinish={handleReview}
          isPending={isCreatingSchema}
          disabledFields={{
            version: true,
          }}
          hideFields={{
            uploadSchemaInput: true,
          }}
          initialValues={{
            schema_type: 'meta',
            path: '',
            name: '',
            type: 'model',
            description: '',
            uploadedColumns: columns,
            version: '1.0.0',
          }}
          config={{
            uploadedTab: {
              tabTitle: 'Schema Columns',
              tableTitle: 'Base Schema Columns',
            },
          }}
        />
      </div>
      {isReviewing && (
        <ReviewCreateSchemaForm
          values={reviewValues}
          buttonLabel={buttonLabel}
          onFinish={handleSubmit}
        />
      )}
    </div>
  );
};

export const CreateSchema = (props: CreateSchemaProps) => {
  return (
    <ListSchemasProvider schemaTypes={['meta']}>
      <CreateSchemaReviewProvider>
        <CreateSchemaBase {...props} />
      </CreateSchemaReviewProvider>
    </ListSchemasProvider>
  );
};
