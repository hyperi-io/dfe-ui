import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  ApiErrorResponseBody,
  getApiErrorResponseBody,
} from '@/core/config/api/client';
import { useCreateDerivedSchema } from '@/Schemas/hooks/useCreateDerivedSchema';
import { TCreateDerivedSchemaResponse } from '@/Schemas/hooks/useCreateDerivedSchema/types';
import { transformFormDataToRequestBody } from '@/Schemas/hooks/useCreateDerivedSchema/useCreateDerivedSchema.helpers';
import { CreateDerivedSchemaFormData } from '@/Schemas/validationSchemas/CreateDerivedSchemaForm.schema';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { CreateDerivedSchemaForm } from './CreateDerivedSchemaForm';

interface CreateDerivedSchemaDrawerProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: (response: TCreateDerivedSchemaResponse) => void;
}

const TRIGGER_LABEL = 'Add Derived Schema';

export const CreateDerivedSchemaDrawer = ({
  open,
  onClose,
  onSuccess,
}: CreateDerivedSchemaDrawerProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(
    open ?? false,
  );
  const [errorMessage, setErrorMessage] = useState<ApiErrorResponseBody | null>(
    null,
  );

  const [api, notificationContextHolder] = notification.useNotification();

  const handleClose = () => {
    setIsDrawerVisible(false);
    setErrorMessage(null);
    onClose?.();
  };

  const { mutate: createDerivedSchema, isPending } = useCreateDerivedSchema({
    onSuccess: (response) => {
      api.success({
        title: 'Derived schema created successfully',
        placement: 'bottomLeft',
      });
      handleClose();
      onSuccess?.(response);
    },
    onError: (error) => {
      const body = getApiErrorResponseBody(error);
      setErrorMessage({
        message: body?.message ?? 'An unexpected error occurred',
        errors: body?.errors ?? [],
      });
    },
  });

  const handleSubmit = (values: CreateDerivedSchemaFormData) => {
    createDerivedSchema(transformFormDataToRequestBody(values));
  };

  return (
    <>
      {notificationContextHolder}
      <RbacProtected action={RbacProtected.rbacActions.schema_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            htmlType="button"
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            {TRIGGER_LABEL}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true, placement: 'bottom' }}>
          <Button
            type="default"
            htmlType="button"
            disabled
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
          >
            {TRIGGER_LABEL}
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Create Derived Schema"
        open={isDrawerVisible}
        size="80%"
        onClose={handleClose}
      >
        <CreateDerivedSchemaForm
          isPending={isPending}
          errorMessage={errorMessage}
          onFinish={handleSubmit}
          onValuesChange={() => setErrorMessage(null)}
        />
      </Drawer>
    </>
  );
};
