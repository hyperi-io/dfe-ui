import { Drawer } from '@/core/components/Drawer';

import { CreateSchemaForm } from '@/Schemas/components/CreateSchemaForm';
import { ReviewForm } from '@/Schemas/components/ReviewCreateSchemaForm';
import {
  CreateSchemaReviewProvider,
  useCreateSchemaReviewContext,
} from '@/Schemas/contexts/CreateSchemaReviewContext';
import { IconPlus } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

interface CreateSchemaDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export const CreateSchemaDrawerBase = ({
  open,
  onClose,
}: CreateSchemaDrawerProps) => {
  const {
    notificationContextHolder,
    drawerTitle,
    isReviewing,
    buttonLabel,
    reviewValues,
    setReviewValues,
    setIsReviewing,
    setDrawerTitle,
    handleReview,
    handleSubmit,
    isCreatingSchema,
  } = useCreateSchemaReviewContext();
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(
    open ?? false,
  );
  const handleClose = () => {
    setIsDrawerVisible(false);
    setReviewValues(null);
    setIsReviewing(false);
    setDrawerTitle('Add Schema');
    onClose?.();
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

export const CreateSchemaDrawer = (props: CreateSchemaDrawerProps) => {
  return (
    <CreateSchemaReviewProvider>
      <CreateSchemaDrawerBase {...props} />
    </CreateSchemaReviewProvider>
  );
};
