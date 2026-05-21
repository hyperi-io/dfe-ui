import { Drawer } from '@/core/components/Drawer';

import { CreateSchemaForm } from '@/Schemas/components/CreateSchemaForm';
import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { ReviewForm } from '@/Schemas/components/ReviewCreateSchemaForm';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { useCreateSchema } from '@/Schemas/hooks/useCreateSchema';
import { transformFormDataToRequestBody } from '@/Schemas/hooks/useCreateSchema/useCreateSchema.helpers';
import { IconChevronsLeft, IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateSchemaDrawer = ({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) => {
  const [drawerTitle, setDrawerTitle] = useState<React.ReactNode | string>(
    'Add Schema',
  );
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewValues, setReviewValues] = useState<CreateSchemaFormData | null>(
    null,
  );

  const buttonLabel = isReviewing ? 'Create Schema' : 'Review Schema';

  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    setReviewValues(null);
    setIsReviewing(false);
    setDrawerTitle('Add Schema');

    onClose?.();
  };

  const {
    refetch: refetchSchemas,
    setSelectedSchemaPath,
    setSelectedSchemaVersion,
  } = useListSchemasContext();

  const { mutate: createSchema, isPending: isCreatingSchema } = useCreateSchema(
    {
      onSuccess: ({ path, current }) => {
        setSelectedSchemaPath(path ?? null);
        setSelectedSchemaVersion(current);
        refetchSchemas();
        api.success({
          title: 'Schema created successfully',
          placement: 'bottomLeft',
        });
        handleClose();
      },
    },
  );

  const handleGoBack = () => {
    setDrawerTitle('Add Schema');
    setIsReviewing(false);
  };

  const handleReview = (values: CreateSchemaFormData) => {
    setDrawerTitle(
      <div className="flex items-center gap-2">
        <Button icon={<IconChevronsLeft />} onClick={handleGoBack} />
        Review Schema
      </div>,
    );
    setIsReviewing(true);
    setReviewValues(values);
  };

  const handleSubmit = (values: CreateSchemaFormData) => {
    const { requestBody } = transformFormDataToRequestBody(values);
    createSchema(requestBody);
  };

  return (
    <>
      {contextHolder}
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
