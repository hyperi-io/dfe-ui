import { Drawer } from '@/core/components/Drawer';

import { CreateSchemaForm } from '@/core/components/CreateSchemaForm';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ReviewForm } from '@/core/components/ReviewCreateSchemaForm';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import {
  CreateSchemaReviewProvider,
  useCreateSchemaReviewContext,
} from '@/core/contexts/CreateSchemaReviewContext';
import {
  ListSchemasProvider,
  useListSchemasContext,
} from '@/core/contexts/ListSchemasContext';
import { useCreateSchema } from '@/core/hooks/useCreateSchema';
import { SchemaCreateResponse } from '@/core/hooks/useCreateSchema/types';
import { transformFormDataToRequestBody } from '@/core/hooks/useCreateSchema/useCreateSchema.helpers';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface CreateSchemaDrawerProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: (response: SchemaCreateResponse) => void;
}

export const CreateSchemaDrawerBase = ({
  open,
  onClose,
  onSuccess,
}: CreateSchemaDrawerProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(
    open ?? false,
  );

  const pathname = usePathname();
  const isSchemaDetail = pathname.includes('/schemas/');

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
      onSuccess: (response) => {
        // TODO: Move this to the onSuccess prop defined by parent
        if (isSchemaDetail) {
          setSelectedSchema({
            schema_path: response.path ?? '',
            schema_version: response.current,
          });
        }
        refetchSchemas();
        api.success({
          title: 'Schema created successfully',
          placement: 'bottomLeft',
        });
        handleClose();
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
    <>
      {notificationContextHolder}
      <RbacProtected action={RbacProtected.rbacActions.SCHEMA_WRITE}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            htmlType="button"
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            Add Schema
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true, placement: 'bottom' }}>
          <Button
            type="default"
            htmlType="button"
            disabled
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            Add Schema
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

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
      <ListSchemasProvider>
        <CreateSchemaDrawerBase {...props} />
      </ListSchemasProvider>
    </CreateSchemaReviewProvider>
  );
};
