import { Drawer } from '@/core/components/Drawer';

import { cn } from '@/core/utils/style';
import { CreateSchemaForm } from '@/Schemas/components/CreateSchemaForm';
import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { ReviewForm } from '@/Schemas/components/ReviewCreateSchemaForm';
import {
  CreateSchemaReviewProvider,
  useCreateSchemaReviewContext,
} from '@/Schemas/contexts/CreateSchemaReviewContext';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { useCreateSchemaVersion } from '@/Schemas/hooks/useCreateSchemaVersion';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { transformFormDataToRequestBody } from './CreateSchemaVersionDrawer.helpers';

interface CreateSchemaVersionDrawerProps {
  open?: boolean;
  onClose?: () => void;
  classNames?: {
    trigger?: string;
  };
}

export const CreateSchemaVersionDrawerBase = ({
  open,
  onClose,
  classNames,
}: CreateSchemaVersionDrawerProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(
    open ?? false,
  );

  const {
    isReviewing,
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

  const {
    refetch: refetchSchemas,
    selectedSchemaPath,
    setSelectedSchema,
  } = useListSchemasContext();

  const { mutate: createSchemaVersion, isPending: isCreatingSchemaVersion } =
    useCreateSchemaVersion({
      onSuccess: ({ current }) => {
        setSelectedSchema({
          schema_path: selectedSchemaPath ?? '',
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
    });

  const handleSubmit = (values: CreateSchemaFormData) => {
    const requestBody = transformFormDataToRequestBody(values);
    createSchemaVersion({
      schema: requestBody,
      parameters: { schema_path: selectedSchemaPath },
    });
  };

  const path = selectedSchemaPath?.split('/').slice(0, -1).join('/');
  const name = selectedSchemaPath?.split('/').pop();

  return (
    <>
      {notificationContextHolder}
      <Button
        type="default"
        className={cn(
          'border border-tertiary text-tertiary',
          classNames?.trigger,
        )}
        icon={<IconPlus className="text-tertiary" />}
        onClick={() => setIsDrawerVisible(true)}
      >
        Add Schema Version
      </Button>
      <Drawer
        title={isReviewing ? 'Review Schema Version' : 'Add Schema Version'}
        open={isDrawerVisible}
        size="80%"
        onClose={handleClose}
      >
        <div className={isReviewing ? 'hidden' : undefined}>
          <CreateSchemaForm
            buttonLabel="Review Schema Version"
            onFinish={handleReview}
            isPending={isCreatingSchemaVersion}
            disabledFields={{
              version: true,
              path: true,
              name: true,
            }}
            hideFields={{
              version: true,
            }}
            initialValues={
              reviewValues ?? {
                path,
                name,
              }
            }
          />
        </div>
        {isReviewing && (
          <ReviewForm
            values={reviewValues}
            buttonLabel="Add Schema Version"
            onFinish={handleSubmit}
            hideFields={{
              version: true,
            }}
          />
        )}
      </Drawer>
    </>
  );
};

export const CreateSchemaVersionDrawer = ({
  ...props
}: CreateSchemaVersionDrawerProps) => {
  return (
    <CreateSchemaReviewProvider>
      <CreateSchemaVersionDrawerBase {...props} />
    </CreateSchemaReviewProvider>
  );
};
