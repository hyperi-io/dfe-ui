import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import { TCreateSourceResponse } from '@/Sources/hooks/useCreateSource/types';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { AwaitingReviewNote, awaitsReview } from '@/Sources/utils/sourceReview';
import { Alert, App } from 'antd';
import { useState } from 'react';

export const CreateSourceStep = ({
  schemaPath,
  onSuccess,
}: {
  schemaPath: string;
  onSuccess: (response: TCreateSourceResponse) => void;
}) => {
  const { notification } = App.useApp();
  const [held, setHeld] = useState<TCreateSourceResponse | null>(null);
  const {
    mutate: createSourceMutation,
    isPending: isCreatingSource,
    error: createSourceError,
  } = useCreateSource({
    onSuccess: (response) => {
      // The source is not on main yet, so the wizard has no source to build or deploy.
      if (awaitsReview(response)) {
        setHeld(response);
        return;
      }
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
  if (held) {
    return (
      <Alert
        type="info"
        showIcon
        title={`${held.source} awaiting review`}
        description={
          <AwaitingReviewNote
            detail={`${held.source} is saved on a review branch. Build and deploy it once the review is merged.`}
            review={held}
          />
        }
      />
    );
  }
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
      }}
    />
  );
};
