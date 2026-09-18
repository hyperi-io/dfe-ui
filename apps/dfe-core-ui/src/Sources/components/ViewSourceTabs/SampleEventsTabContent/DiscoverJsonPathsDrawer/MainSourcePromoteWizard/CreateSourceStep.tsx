import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import { TCreateSourceResponse } from '@/Sources/hooks/useCreateSource/types';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { App } from 'antd';

export const CreateSourceStep = ({
  schemaPath,
  onSuccess,
}: {
  schemaPath: string;
  onSuccess: (response: TCreateSourceResponse) => void;
}) => {
  const { notification } = App.useApp();
  const {
    mutate: createSourceMutation,
    isPending: isCreatingSource,
    error: createSourceError,
  } = useCreateSource({
    onSuccess: (response) => {
      notification.success({
        title: `${response.source} created successfully`,
        placement: 'bottomLeft',
      });
      onSuccess?.(response);
    },
  });

  const handleCreateSource = (values: CreateUpdateSourceFormData) => {
    const transformedValues = transformSourceFormDataToRequestBody(values);
    createSourceMutation(transformedValues);
  };
  return (
    <CreateUpdateSourceForm
      onFinish={handleCreateSource}
      isPending={isCreatingSource}
      error={createSourceError}
      initialValues={{
        origin: 'receiver',
        source: '',
        enabled: true,
        archive: false,
        schema: {
          meta_schema: schemaPath,
          meta_schema_version: '1.0.0',
        },
        _assignSchema: 'define_schema',
      }}
    />
  );
};
