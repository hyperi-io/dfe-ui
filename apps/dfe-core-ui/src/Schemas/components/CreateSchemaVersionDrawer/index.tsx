import { Drawer } from '@/core/components/Drawer';

import { CreateSchemaForm } from '@/core/components/CreateSchemaForm';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ReviewCreateSchemaForm } from '@/core/components/ReviewCreateSchemaForm';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import {
  CreateSchemaReviewProvider,
  useCreateSchemaReviewContext,
} from '@/core/contexts/CreateSchemaReviewContext';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { cn } from '@/core/utils/style';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { useCreateSchemaVersion } from '@/Schemas/hooks/useCreateSchemaVersion';
import { useFetchInfiniteFilteredSchemaDetailColumns } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns';
import { MetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { IconLock, IconPlus } from '@repo/dfe-icons';
import { Button, notification, Spin } from 'antd';
import { useMemo, useState } from 'react';
import {
  metaSchemaDetailToCreateVersionFormInitialValues,
  transformFormDataToRequestBody,
  transformFormDataToReviewRequestBody,
} from './CreateSchemaVersionDrawer.helpers';

interface CreateSchemaVersionDrawerProps {
  onClose?: () => void;
  classNames?: {
    trigger?: string;
  };
  disabled?: boolean;
  schema?: MetaSchemaDetailResponse;
}

export const CreateSchemaVersionDrawerBase = ({
  onClose,
  classNames,
  disabled,
  schema,
}: CreateSchemaVersionDrawerProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);

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
        const body = getApiErrorResponseBody(error);
        setFormErrorMessage({
          message: body?.message ?? 'An unexpected error occurred',
          errors: body?.errors ?? [],
        });
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

  const sourceVersion = schema?.selected ?? null;

  const { data: fullSchemaDetail, isLoading: isLoadingSchemaDetail } =
    useFetchInfiniteFilteredSchemaDetailColumns({
      schema_path: selectedSchemaPath,
      version: sourceVersion,
      per_page: -1,
      enabled: isDrawerVisible,
    });

  const detailForForm = fullSchemaDetail ?? schema;

  const formInitialValues = useMemo(
    () =>
      metaSchemaDetailToCreateVersionFormInitialValues(detailForForm, {
        path,
        name,
      }),
    [detailForForm, path, name],
  );

  /** Keep the form mounted while reviewing (hidden) so column state is preserved on Back. */
  const formReady =
    isDrawerVisible && (!isLoadingSchemaDetail || fullSchemaDetail != null);

  return (
    <>
      {notificationContextHolder}
      <RbacProtected action={RbacProtected.rbacActions.schema_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            className={cn(
              !disabled && 'border border-tertiary text-tertiary',
              classNames?.trigger,
            )}
            icon={
              disabled ? <IconLock /> : <IconPlus className="text-tertiary" />
            }
            onClick={() => setIsDrawerVisible(true)}
            disabled={disabled}
          >
            Add Schema Version
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="ml-auto"
          tooltip={{ show: true, placement: 'left' }}
        >
          <Button
            type="default"
            disabled
            className={cn(
              'border border-tertiary text-tertiary',
              classNames?.trigger,
            )}
          >
            Add Schema Version
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={isReviewing ? 'Review Schema Version' : 'Add Schema Version'}
        open={isDrawerVisible}
        size="80%"
        onClose={handleClose}
      >
        <div className={isReviewing ? 'hidden' : undefined}>
          {formReady ? (
            <CreateSchemaForm
              key={`${selectedSchemaPath}-${sourceVersion}-${detailForForm?.version.columns.items.length ?? 0}`}
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
                uploadSchemaInput: true,
              }}
              initialValues={reviewValues ?? formInitialValues}
            />
          ) : (
            <div className="flex h-[calc(100vh-120px)] items-center justify-center">
              <Spin />
            </div>
          )}
        </div>
        {isReviewing && (
          <ReviewCreateSchemaForm
            values={reviewValues}
            buttonLabel="Add Schema Version"
            onFinish={handleSubmit}
            transformToReview={transformFormDataToReviewRequestBody}
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
