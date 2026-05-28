import { Drawer } from '@/core/components/Drawer';

import { CreateSchemaForm } from '@/Schemas/components/CreateSchemaForm';
import { ReviewForm } from '@/Schemas/components/ReviewCreateSchemaForm';
import {
  CreateSchemaReviewProvider,
  useCreateSchemaReviewContext,
} from '@/Schemas/contexts/CreateSchemaReviewContext';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { useCreateSchema } from '@/core/hooks/useCreateSchema';
import { transformFormDataToRequestBody } from '@/core/hooks/useCreateSchema/useCreateSchema.helpers';
import { CreateSchemaFormData } from '@/core/schemas/CreateSchemaForm/CreateSchemaForm.schema';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

interface CreateSchemaDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export const CreateSchemaDrawerBase = ({
  open,
  onClose,
}: CreateSchemaDrawerProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(
    open ?? false,
  );

  const {
    drawerTitle,
    isReviewing,
    buttonLabel,
    reviewValues,
    handleReview,
    handleReset,
    setFormErrorMessage,
  } = useCreateSchemaReviewContext();

  const [api, notificationContextHolder] = notification.useNotification();

  const handleClose = () => {
    setIsDrawerVisible(false);
    handleReset();
    onClose?.();
  };

  const { refetch: refetchSchemas, setSelectedSchema } =
    useListSchemasContext();

  const { mutate: createSchema, isPending: isCreatingSchema } = useCreateSchema(
    {
      onSuccess: ({ path, current }) => {
        setSelectedSchema({
          schema_path: path ?? '',
          schema_version: current,
        });
        refetchSchemas();
        api.success({
          title: 'Schema created successfully',
          placement: 'bottomLeft',
        });
        handleClose();
      },
      onError: (error) => {
        setFormErrorMessage(error?.message ?? 'An unexpected error occurred');
      },
    },
  );

  const handleSubmit = (values: CreateSchemaFormData) => {
    const { requestBody } = transformFormDataToRequestBody(values);
    createSchema(requestBody);
  };

  return (
    <>
      {notificationContextHolder}
      <Button
        type="default"
        className="border border-tertiary text-tertiary"
        icon={<IconPlus className="text-tertiary" />}
        onClick={() => setIsDrawerVisible(true)}
      >
        Add Schema
      </Button>
      <Drawer
        title={drawerTitle}
        open={isDrawerVisible}
        size="80%"
        onClose={handleClose}
      >
        <div className={isReviewing ? 'hidden' : undefined}>
          <CreateSchemaForm
            buttonLabel={buttonLabel}
            onFinish={handleReview}
            isPending={isCreatingSchema}
            disabledFields={{
              type: true,
              version: true,
            }}
            initialValues={
              reviewValues ?? {
                type: 'model',
                version: '1.0.0',
              }
            }
          />
        </div>
        {isReviewing && (
          <ReviewForm
            values={reviewValues}
            buttonLabel={buttonLabel}
            onFinish={handleSubmit}
          />
        )}
      </Drawer>
    </>
  );
};

export const CreateSchemaDrawer = ({ ...props }: CreateSchemaDrawerProps) => {
  return (
    <CreateSchemaReviewProvider>
      <CreateSchemaDrawerBase {...props} />
    </CreateSchemaReviewProvider>
  );
};
